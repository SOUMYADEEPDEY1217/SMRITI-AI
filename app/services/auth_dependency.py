from fastapi import Header, HTTPException
from app.services import firebase_service


def get_current_user(authorization: str = Header(None)) -> dict:
    """
    Use as a route dependency: `user: dict = Depends(get_current_user)`
    Frontend must send: Authorization: Bearer <firebase_id_token>
    Returns the decoded token dict, which includes uid, email, etc.

    SECURITY: verify_id_token (see firebase_service.py) uses check_revoked=True,
    so a token from a session that's been explicitly revoked is rejected even
    if it hasn't naturally expired yet.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.split(" ", 1)[1]
    try:
        decoded = firebase_service.verify_id_token(token)
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
