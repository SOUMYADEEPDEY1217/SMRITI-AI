from fastapi import Header, HTTPException
from app.services import db_service


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
        decoded = db_service.verify_id_token(token)
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_admin_user(authorization: str = Header(None)) -> dict:
    """
    Requires role == 'admin' in Firebase custom claims.

    SECURITY: Custom claims are set server-side via the Firebase Admin SDK and
    are cryptographically embedded in the signed JWT — a client cannot forge or
    elevate them by any means. Never trust a role from the request body.
    """
    user = get_current_user(authorization)
    claims = user.get("role", None)
    if claims != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required. Your account does not have the 'admin' role.",
        )
    return user


def get_doctor_user(authorization: str = Header(None)) -> dict:
    """
    Requires role == 'doctor' OR role == 'admin'.
    Admins can access doctor routes since they have higher privileges.
    """
    user = get_current_user(authorization)
    role = user.get("role", None)
    if role not in ("doctor", "admin"):
        raise HTTPException(
            status_code=403,
            detail="Doctor or Admin access required.",
        )
    return user
