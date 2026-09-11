"""
Authentication router for Cognitive Care platform.
Supports Patient, Doctor/Nurse, and Admin roles.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, Literal
from app.services import firebase_service
from app.services.auth_dependency import get_current_user
import uuid

router = APIRouter(prefix="/api/auth", tags=["auth"])

RoleType = Literal["patient", "doctor", "admin"]


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1, max_length=100)
    role: RoleType = "patient"


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3, max_length=120)
    password: str = Field(..., min_length=4, max_length=100)
    role: RoleType = "patient"
    language: Optional[str] = "en"


# Seed default profiles
DEFAULT_PROFILES = {
    "patient": {
        "id": "patient-1",
        "name": "Ramesh Patel",
        "role": "patient",
        "age": 72,
        "difficulty": "Medium",
        "language": "en",
        "email": "ramesh.patel@cognitivecare.com",
        "clinic": "Apollo Geriatric Memory Clinic",
    },
    "doctor": {
        "id": "doc-1",
        "name": "Dr. Ananya Sharma",
        "role": "doctor",
        "specialty": "Geriatric Neurology",
        "email": "dr.ananya@cognitivecare.com",
        "clinic": "Apollo Geriatric Memory Clinic",
    },
    "admin": {
        "id": "admin-1",
        "name": "System Administrator",
        "role": "admin",
        "email": "admin@cognitivecare.com",
    },
}


@router.post("/login")
def login(payload: LoginRequest):
    """
    Authenticate a user by role.
    Generates a session bearer token with full role and identity context.
    """
    role = payload.role
    username = payload.username.strip().lower()

    # Pre-configured demo profiles or username matching
    profile = DEFAULT_PROFILES.get(role, DEFAULT_PROFILES["patient"]).copy()
    if username not in ["ramesh.patel", "dr.ananya", "admin"]:
        profile["name"] = payload.username.strip()
        profile["email"] = f"{payload.username.strip()}@cognitivecare.com"

    token = f"demo-{role}-{uuid.uuid4().hex[:12]}"

    # Cache profile in local document store for lookup
    firebase_service.add_document("users", profile, doc_id=profile["id"])

    return {
        "status": "success",
        "token": token,
        "user": profile,
    }


@router.post("/signup")
def signup(payload: SignupRequest):
    """
    Register a new patient, clinician, or administrator account.
    """
    user_id = f"{payload.role}-{uuid.uuid4().hex[:8]}"
    new_user = {
        "id": user_id,
        "name": payload.name.strip(),
        "email": payload.email.strip().lower(),
        "role": payload.role,
        "difficulty": "Medium",
        "language": payload.language or "en",
    }

    firebase_service.add_document("users", new_user, doc_id=user_id)
    token = f"demo-{payload.role}-{uuid.uuid4().hex[:12]}"

    return {
        "status": "success",
        "token": token,
        "user": new_user,
    }


@router.get("/me")
def get_profile(user=Depends(get_current_user)):
    """
    Returns verified profile from bearer token.
    """
    stored = firebase_service.get_document("users", user.get("uid"))
    if stored:
        return stored
    return {
        "id": user.get("uid"),
        "name": user.get("name", "Cognitive Care User"),
        "role": user.get("role", "patient"),
        "email": user.get("email", ""),
        "difficulty": "Medium",
        "language": "en",
    }
