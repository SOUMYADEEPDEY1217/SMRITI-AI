"""
Thin wrapper around Firebase Admin SDK (Auth) and Firestore.

SECURITY NOTES:
- verify_id_token uses the Admin SDK's own verification (signature, expiry,
  issuer, audience all checked by the SDK) - we never decode the JWT
  ourselves, which would be easy to get subtly wrong.
- check_revoked=True so a token from a session the user (or an admin)
  explicitly revoked is rejected even if it hasn't expired yet.
- add_document/update_document never accept a raw 'user_id' override from
  a generic caller by convention - routers are responsible for setting it
  from the verified token, never from client input. This module doesn't
  enforce that itself (it's a generic Firestore wrapper) - the enforcement
  lives in each router, consistently, per architecture.md.
"""
import firebase_admin
from firebase_admin import credentials, auth, firestore
from app.core.config import settings

_app = firebase_admin.initialize_app(
    credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH),
    {"projectId": settings.FIREBASE_PROJECT_ID},
)
_db = firestore.client()

MAX_QUERY_RESULTS = 500  # hard cap - an unbounded query on a large collection is a DoS vector


def verify_id_token(id_token: str) -> dict:
    """Raises on invalid/expired/revoked token. Never trust a token without this."""
    return auth.verify_id_token(id_token, check_revoked=True)


def add_document(collection: str, data: dict, doc_id: str | None = None) -> str:
    if doc_id:
        _db.collection(collection).document(doc_id).set(data)
        return doc_id
    ref = _db.collection(collection).add(data)[1]
    return ref.id


def get_document(collection: str, doc_id: str) -> dict | None:
    snap = _db.collection(collection).document(doc_id).get()
    if not snap.exists:
        return None
    data = snap.to_dict()
    data["_id"] = snap.id
    return data


def update_document(collection: str, doc_id: str, changes: dict) -> None:
    _db.collection(collection).document(doc_id).update(changes)


def delete_document(collection: str, doc_id: str) -> None:
    _db.collection(collection).document(doc_id).delete()


def query_by_field(collection: str, field: str, value) -> list[dict]:
    """
    SECURITY: this is how every router scopes data to the requesting user
    (field='user_id', value=user['uid']). Capped at MAX_QUERY_RESULTS so a
    user who has accumulated a huge amount of data can't be used to trigger
    an unbounded, expensive read.
    """
    docs = (
        _db.collection(collection)
        .where(field, "==", value)
        .limit(MAX_QUERY_RESULTS)
        .stream()
    )
    results = []
    for d in docs:
        data = d.to_dict()
        data["_id"] = d.id
        results.append(data)
    return results


def query_all(collection: str, limit: int = MAX_QUERY_RESULTS) -> list[dict]:
    """
    Admin-only helper: returns all documents in a collection up to `limit`.
    Regular user routes should NEVER call this — use query_by_field with
    user_id instead so each user only sees their own data.
    """
    limit = min(limit, MAX_QUERY_RESULTS)
    docs = _db.collection(collection).limit(limit).stream()
    results = []
    for d in docs:
        data = d.to_dict()
        data["_id"] = d.id
        results.append(data)
    return results


def set_user_custom_claims(uid: str, claims: dict) -> None:
    """
    Sets Firebase custom claims on a user account (e.g. {"role": "doctor"}).
    Claims are embedded in the signed JWT on next token refresh — the client
    cannot forge them.

    SECURITY: only call this from admin-gated routes. The uid here is
    the TARGET user (the one being promoted), verified before calling.
    """
    auth.set_custom_user_claims(uid, claims)


def get_user_by_email(email: str) -> dict | None:
    """
    Resolves a Firebase user by email. Returns the UserRecord dict or None.
    Used by the admin role-assignment endpoint so the admin can specify a
    user by human-readable email rather than having to know their UID.
    """
    try:
        user = auth.get_user_by_email(email)
        return {"uid": user.uid, "email": user.email, "custom_claims": user.custom_claims or {}}
    except auth.UserNotFoundError:
        return None


def list_firebase_users(max_results: int = 100) -> list[dict]:
    """
    Lists Firebase Auth users (paginated, capped at max_results).
    Used by the admin endpoint to enumerate registered patients.
    SECURITY: admin-gated route only.
    """
    max_results = min(max_results, 500)
    page = auth.list_users(max_results=max_results)
    result = []
    for user in page.users:
        result.append({
            "uid": user.uid,
            "email": user.email,
            "display_name": user.display_name,
            "role": (user.custom_claims or {}).get("role", "patient"),
            "disabled": user.disabled,
        })
    return result
