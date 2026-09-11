from fastapi import APIRouter, Depends, HTTPException
from typing import Literal
from pydantic import BaseModel, Field
from datetime import datetime, timedelta

from app.services import db_service
from app.api.dependencies import get_admin_user, get_doctor_user, get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])

ValidRole = Literal["patient", "caregiver", "doctor", "admin"]
ValidLanguage = Literal["en", "bn"]

class UserProfileUpdate(BaseModel):
    preferred_language: ValidLanguage = Field(..., description="User's preferred language (e.g., 'en' for English, 'bn' for Bengali)")

# --- User Profile Routes ---

@router.get("/me")
def get_my_profile(user=Depends(get_current_user)):
    """Fetch the current user's profile settings (e.g., language)."""
    doc = db_service.get_document("users", user["uid"])
    if not doc:
        # Default profile if not created yet
        return {"uid": user["uid"], "preferred_language": "en"}
    return doc


@router.patch("/me")
def update_my_profile(payload: UserProfileUpdate, user=Depends(get_current_user)):
    """Update the current user's profile settings."""
    doc = db_service.get_document("users", user["uid"])
    changes = {"preferred_language": payload.preferred_language}
    if not doc:
        db_service.add_document("users", changes, doc_id=user["uid"])
    else:
        db_service.update_document("users", user["uid"], changes)
    return {"status": "success", "preferred_language": payload.preferred_language}


# --- Admin Routes ---

@router.get("/patients")
def list_all_patients(admin=Depends(get_admin_user)):
    """Returns all registered Firebase Auth users with their role."""
    return db_service.list_firebase_users(max_results=500)


@router.get("/patients/{patient_uid}/profile")
def get_patient_profile(patient_uid: str, admin=Depends(get_admin_user)):
    """Fetch a single user's Firebase profile + role."""
    from firebase_admin import auth
    try:
        user = auth.get_user(patient_uid)
    except auth.UserNotFoundError:
        raise HTTPException(status_code=404, detail="User not found.")
    # All other exceptions (network, SDK bugs) intentionally bubble up as 500
    return {
        "uid": user.uid,
        "email": user.email,
        "display_name": user.display_name,
        "role": (user.custom_claims or {}).get("role", "patient"),
        "disabled": user.disabled,
    }


class RoleAssignment(BaseModel):
    email: str = Field(..., description="Email of the user to promote/change")
    role: ValidRole = Field(..., description="New role to assign")


@router.post("/roles/assign")
def assign_role(payload: RoleAssignment, admin=Depends(get_admin_user)):
    """Sets a Firebase custom claim (role) on a target user account."""
    target = db_service.get_user_by_email(payload.email)
    if not target:
        raise HTTPException(status_code=404, detail=f"No Firebase user found with email: {payload.email}")

    db_service.set_user_custom_claims(target["uid"], {"role": payload.role})
    return {
        "assigned": True,
        "uid": target["uid"],
        "email": payload.email,
        "new_role": payload.role,
        "note": "The user must sign out and back in for the new role to be reflected in their token.",
    }


# --- Doctor Routes ---

@router.get("/patients/{patient_uid}/summary")
def patient_summary(patient_uid: str, doctor=Depends(get_doctor_user)):
    """High-level snapshot for a quick dashboard card."""
    memories = db_service.query_by_field("memories", "user_id", patient_uid)
    attempts = db_service.query_by_field("quiz_attempts", "user_id", patient_uid)
    reminders = db_service.query_by_field("reminders", "user_id", patient_uid)

    total_attempts = len(attempts)
    total_correct = sum(1 for a in attempts if a.get("correct"))
    overall_accuracy = round(total_correct / total_attempts, 3) if total_attempts else None

    cutoff = (datetime.utcnow() - timedelta(days=7)).isoformat()
    recent_7d = [a for a in attempts if a.get("timestamp", "") >= cutoff]
    recent_7d_accuracy = (
        round(sum(1 for a in recent_7d if a.get("correct")) / len(recent_7d), 3)
        if recent_7d else None
    )

    sorted_attempts = sorted(attempts, key=lambda a: a.get("timestamp", ""), reverse=True)
    current_difficulty = sorted_attempts[0].get("difficulty") if sorted_attempts else "medium"

    active_reminders = [r for r in reminders if not r.get("completed")]
    now = datetime.utcnow()
    overdue = []
    for r in active_reminders:
        try:
            due = datetime.fromisoformat(r["due_at"].replace("Z", "+00:00")).replace(tzinfo=None)
            if due < now:
                overdue.append(r)
        except (KeyError, ValueError):
            pass

    return {
        "patient_uid": patient_uid,
        "total_memories": len(memories),
        "total_quiz_attempts": total_attempts,
        "overall_accuracy": overall_accuracy,
        "accuracy_last_7d": recent_7d_accuracy,
        "current_difficulty": current_difficulty,
        "active_reminders": len(active_reminders),
        "overdue_reminders": len(overdue),
    }
