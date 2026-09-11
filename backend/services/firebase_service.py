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
from app.config import settings

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
