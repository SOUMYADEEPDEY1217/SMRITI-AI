from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

from app.services import db_service
from app.api.dependencies import get_current_user, get_admin_user, get_doctor_user
from app.core.limiter import limiter
from app.core.config import settings

router = APIRouter(prefix="/api/reminders", tags=["reminders"])

RecurrenceType = Literal["none", "daily", "weekly", "monthly"]


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ReminderCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    notes: Optional[str] = Field(default=None, max_length=1000)
    due_at: str
    recurrence: RecurrenceType = "none"
    category: Optional[str] = Field(default=None, max_length=50)

    def validate_due_at(self):
        try:
            datetime.fromisoformat(self.due_at.replace("Z", "+00:00"))
        except ValueError:
            raise HTTPException(status_code=400, detail="due_at must be a valid ISO 8601 datetime.")


class ReminderUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    notes: Optional[str] = Field(default=None, max_length=1000)
    due_at: Optional[str] = None
    recurrence: Optional[RecurrenceType] = None
    category: Optional[str] = Field(default=None, max_length=50)


# ---------------------------------------------------------------------------
# Shared Internal Logic
# ---------------------------------------------------------------------------

def _get_owned_reminder(reminder_id: str, user_uid: str) -> dict:
    reminder = db_service.get_document("reminders", reminder_id)
    if not reminder or reminder.get("user_id") != user_uid:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return reminder


def _create_reminder_logic(reminder: ReminderCreate, target_uid: str, creator_uid: str):
    reminder.validate_due_at()
    data = {
        **reminder.model_dump(),
        "user_id": target_uid,
        "created_by": creator_uid,
        "completed": False,
        "completed_at": None,
        "created_at": datetime.utcnow().isoformat(),
    }
    reminder_id = db_service.add_document("reminders", data)
    return {"reminder_id": reminder_id, **data}


# ---------------------------------------------------------------------------
# Patient Routes
# ---------------------------------------------------------------------------

@router.post("/")
@limiter.limit(settings.RATE_LIMIT_DEFAULT)
def create_reminder(request: Request, reminder: ReminderCreate, user=Depends(get_current_user)):
    return _create_reminder_logic(reminder, target_uid=user["uid"], creator_uid=user["uid"])


@router.get("/")
def list_reminders(include_completed: bool = False, user=Depends(get_current_user)):
    reminders = db_service.query_by_field("reminders", "user_id", user["uid"])
    if not include_completed:
        reminders = [r for r in reminders if not r.get("completed")]
    return sorted(reminders, key=lambda r: r.get("due_at", ""))


@router.get("/upcoming")
def upcoming_reminders(within_hours: int = 24, user=Depends(get_current_user)):
    within_hours = max(1, min(within_hours, 168))  # clamp: max 1 week
    now = datetime.utcnow()
    reminders = db_service.query_by_field("reminders", "user_id", user["uid"])
    due_soon = []
    for r in reminders:
        if r.get("completed"):
            continue
        try:
            due = datetime.fromisoformat(r["due_at"].replace("Z", "+00:00")).replace(tzinfo=None)
        except (KeyError, ValueError):
            continue
        hours_until = (due - now).total_seconds() / 3600
        if -1 <= hours_until <= within_hours:
            due_soon.append(r)
    return sorted(due_soon, key=lambda r: r["due_at"])


@router.patch("/{reminder_id}")
def update_reminder(reminder_id: str, update: ReminderUpdate, user=Depends(get_current_user)):
    _get_owned_reminder(reminder_id, user["uid"])
    changes = {k: v for k, v in update.model_dump().items() if v is not None}
    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update.")
    if "due_at" in changes:
        try:
            datetime.fromisoformat(changes["due_at"].replace("Z", "+00:00"))
        except ValueError:
            raise HTTPException(status_code=400, detail="due_at must be a valid ISO 8601 datetime.")
    db_service.update_document("reminders", reminder_id, changes)
    return {**_get_owned_reminder(reminder_id, user["uid"])}


@router.post("/{reminder_id}/complete")
def complete_reminder(reminder_id: str, user=Depends(get_current_user)):
    reminder = _get_owned_reminder(reminder_id, user["uid"])
    db_service.update_document(
        "reminders", reminder_id,
        {"completed": True, "completed_at": datetime.utcnow().isoformat()},
    )

    next_reminder = None
    recurrence = reminder.get("recurrence", "none")
    if recurrence != "none":
        try:
            due = datetime.fromisoformat(reminder["due_at"].replace("Z", "+00:00"))
        except ValueError:
            due = None
        if due:
            delta_days = {"daily": 1, "weekly": 7, "monthly": 30}[recurrence]
            next_due = due.fromtimestamp(due.timestamp() + delta_days * 86400, tz=due.tzinfo)
            next_data = {
                "title": reminder["title"],
                "notes": reminder.get("notes"),
                "due_at": next_due.isoformat(),
                "recurrence": recurrence,
                "category": reminder.get("category"),
                "user_id": user["uid"],
                "created_by": reminder.get("created_by", user["uid"]),
                "completed": False,
                "completed_at": None,
                "created_at": datetime.utcnow().isoformat(),
            }
            next_id = db_service.add_document("reminders", next_data)
            next_reminder = {"reminder_id": next_id, **next_data}

    return {"completed": True, "next_reminder": next_reminder}


@router.delete("/{reminder_id}")
def delete_reminder(reminder_id: str, user=Depends(get_current_user)):
    _get_owned_reminder(reminder_id, user["uid"])
    db_service.delete_document("reminders", reminder_id)
    return {"deleted": True, "reminder_id": reminder_id}


# ---------------------------------------------------------------------------
# Admin Routes
# ---------------------------------------------------------------------------

@router.get("/admin/patients/{patient_uid}")
def admin_list_reminders(patient_uid: str, admin=Depends(get_admin_user)):
    return db_service.query_by_field("reminders", "user_id", patient_uid)


@router.post("/admin/patients/{patient_uid}")
def admin_create_reminder(patient_uid: str, reminder: ReminderCreate, admin=Depends(get_admin_user)):
    return _create_reminder_logic(reminder, target_uid=patient_uid, creator_uid=admin["uid"])


@router.delete("/admin/patients/{patient_uid}/{reminder_id}")
def admin_delete_reminder(patient_uid: str, reminder_id: str, admin=Depends(get_admin_user)):
    reminder = db_service.get_document("reminders", reminder_id)
    if not reminder or reminder.get("user_id") != patient_uid:
        raise HTTPException(status_code=404, detail="Reminder not found for this patient.")
    db_service.delete_document("reminders", reminder_id)
    return {"deleted": True, "reminder_id": reminder_id}


# ---------------------------------------------------------------------------
# Doctor Routes
# ---------------------------------------------------------------------------

@router.get("/doctor/patients/{patient_uid}/upcoming")
def patient_upcoming_reminders(patient_uid: str, within_hours: int = 48, doctor=Depends(get_doctor_user)):
    within_hours = max(1, min(within_hours, 168))
    now = datetime.utcnow()
    reminders = db_service.query_by_field("reminders", "user_id", patient_uid)
    due_soon = []
    for r in reminders:
        if r.get("completed"):
            continue
        try:
            due = datetime.fromisoformat(r["due_at"].replace("Z", "+00:00")).replace(tzinfo=None)
        except (KeyError, ValueError):
            continue
        hours_until = (due - now).total_seconds() / 3600
        if -1 <= hours_until <= within_hours:
            due_soon.append(r)
    return sorted(due_soon, key=lambda r: r.get("due_at", ""))
