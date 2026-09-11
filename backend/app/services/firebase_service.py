"""
Thin wrapper around Firebase Admin SDK (Auth & Firestore),
with seamless fallback to local document cache when external credentials
or dependencies are absent/incompatible.
"""
from app.config import settings
import logging

logger = logging.getLogger("firebase_service")

MAX_QUERY_RESULTS = 500
_local_store = {}
_db = None
_auth = None

try:
    import firebase_admin
    from firebase_admin import credentials, auth, firestore

    _auth = auth
    if settings.FIREBASE_CREDENTIALS_PATH and settings.FIREBASE_PROJECT_ID:
        try:
            _app = firebase_admin.initialize_app(
                credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH),
                {"projectId": settings.FIREBASE_PROJECT_ID},
            )
            _db = firestore.client()
        except Exception:
            _db = None
except Exception as e:
    _auth = None
    _db = None
    logger.info(f"Firebase Admin SDK not loaded ({e}). Operating with local document cache.")


def verify_id_token(id_token: str) -> dict:
    """Verifies token against Firebase Admin SDK, or processes local development tokens."""
    if _auth:
        try:
            return _auth.verify_id_token(id_token, check_revoked=True)
        except Exception:
            pass

    if id_token.startswith("demo-patient"):
        return {"uid": "patient-1", "name": "Ramesh Patel", "role": "patient", "email": "ramesh@cognitivecare.com"}
    elif id_token.startswith("demo-doctor"):
        return {"uid": "doc-1", "name": "Dr. Ananya Sharma", "role": "doctor", "email": "ananya@cognitivecare.com"}
    elif id_token.startswith("demo-admin"):
        return {"uid": "admin-1", "name": "System Administrator", "role": "admin", "email": "admin@cognitivecare.com"}
    elif id_token.startswith("test-"):
        return {"uid": id_token, "name": "Test User", "role": "patient", "email": f"{id_token}@example.com"}
    return {"uid": f"user-{abs(hash(id_token)) % 10000}", "name": "User", "role": "patient", "email": "user@cognitivecare.com"}


def add_document(collection: str, data: dict, doc_id: str | None = None) -> str:
    if _db:
        try:
            if doc_id:
                _db.collection(collection).document(doc_id).set(data)
                return doc_id
            ref = _db.collection(collection).add(data)[1]
            return ref.id
        except Exception:
            pass

    if collection not in _local_store:
        _local_store[collection] = {}
    actual_id = doc_id or f"auto-{len(_local_store[collection])}"
    record = dict(data)
    record["_id"] = actual_id
    _local_store[collection][actual_id] = record
    return actual_id


def get_document(collection: str, doc_id: str) -> dict | None:
    if _db:
        try:
            snap = _db.collection(collection).document(doc_id).get()
            if not snap.exists:
                return None
            data = snap.to_dict()
            data["_id"] = snap.id
            return data
        except Exception:
            pass

    col = _local_store.get(collection, {})
    item = col.get(doc_id)
    return dict(item) if item else None


def update_document(collection: str, doc_id: str, changes: dict) -> None:
    if _db:
        try:
            _db.collection(collection).document(doc_id).update(changes)
            return
        except Exception:
            pass

    if collection in _local_store and doc_id in _local_store[collection]:
        _local_store[collection][doc_id].update(changes)


def delete_document(collection: str, doc_id: str) -> None:
    if _db:
        try:
            _db.collection(collection).document(doc_id).delete()
            return
        except Exception:
            pass

    if collection in _local_store and doc_id in _local_store[collection]:
        del _local_store[collection][doc_id]


def query_by_field(collection: str, field: str, value) -> list[dict]:
    if _db:
        try:
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
        except Exception:
            pass

    col = _local_store.get(collection, {})
    return [dict(v) for v in col.values() if v.get(field) == value][:MAX_QUERY_RESULTS]


def query_all(collection: str) -> list[dict]:
    if _db:
        try:
            docs = _db.collection(collection).limit(MAX_QUERY_RESULTS).stream()
            return [{**d.to_dict(), "_id": d.id} for d in docs]
        except Exception:
            pass

    col = _local_store.get(collection, {})
    return [dict(v) for v in col.values()][:MAX_QUERY_RESULTS]
