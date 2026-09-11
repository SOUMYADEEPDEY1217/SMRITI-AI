"""
Reminders module. Was schema-only with no implementation - this is the
highest-ROI gap since it has no dependency on anything unfinished.

Model: a reminder belongs to a user_id (the elder / primary account) and can
optionally be created_by a caregiver/family member on that user's behalf
(human-in-the-loop: caregivers propose, but reminders only ever live under
the elder's own account, never a separate caregiver-owned copy).

SECURITY: every read/write is scoped to user["uid"] - the same
ownership-check pattern used in the fixed memories.py / quiz.py, so one
account can never read, edit, or complete another account's reminders.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from app.services import firebase_service
from app.services.auth_dependency import get_current_user
from app.limiter import limiter
from app.config import settings

router = APIRouter(prefix="/api/reminders", tags=["reminders"])

RecurrenceType = Literal["none", "daily", "weekly", "monthly"]


class ReminderCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    notes: Optional[str] = Field(default=None, max_length=1000)
    due_at: str  # ISO 8601 datetime string, validated below
    recurrence: RecurrenceType = "none"
    category: Optional[str] = Field(default=None, max_length=50)  # e.g. medication, appointment, hydration

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


def _get_owned_reminder(reminder_id: str, user_uid: str) -> dict:
    reminder = firebase_service.get_document("reminders", reminder_id)
    if not reminder or reminder.get("user_id") != user_uid:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return reminder


@router.post("/")
@limiter.limit(settings.RATE_LIMIT_DEFAULT)
def create_reminder(request: Request, reminder: ReminderCreate, user=Depends(get_current_user)):
    reminder.validate_due_at()

    data = {
        **reminder.model_dump(),
        "user_id": user["uid"],
        "created_by": user["uid"],  # caregiver flows pass a family-member-scoped token later; still elder-owned
        "completed": False,
        "completed_at": None,
        "created_at": datetime.utcnow().isoformat(),
    }
    reminder_id = firebase_service.add_document("reminders", data)
    return {"reminder_id": reminder_id, **data}


@router.get("/")
def list_reminders(
    include_completed: bool = False,
    user=Depends(get_current_user),
):
    """Returns the user's reminders, soonest due_at first."""
    reminders = firebase_service.query_by_field("reminders", "user_id", user["uid"])
    if not include_completed:
        reminders = [r for r in reminders if not r.get("completed")]
    return sorted(reminders, key=lambda r: r.get("due_at", ""))


@router.get("/upcoming")
def upcoming_reminders(within_hours: int = 24, user=Depends(get_current_user)):
    """Reminders due within the next N hours - what a home screen widget would poll."""
    now = datetime.utcnow()
    reminders = firebase_service.query_by_field("reminders", "user_id", user["uid"])
    due_soon = []
    for r in reminders:
        if r.get("completed"):
            continue
        try:
            due = datetime.fromisoformat(r["due_at"].replace("Z", "+00:00")).replace(tzinfo=None)
        except (KeyError, ValueError):
            continue
        hours_until = (due - now).total_seconds() / 3600
        if -1 <= hours_until <= within_hours:  # small grace window for just-missed reminders
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
    firebase_service.update_document("reminders", reminder_id, changes)
    return {**_get_owned_reminder(reminder_id, user["uid"])}


@router.post("/{reminder_id}/complete")
def complete_reminder(reminder_id: str, user=Depends(get_current_user)):
    """
    Marks done, and if recurring, schedules the next occurrence.
    Simple fixed-interval recurrence - enough for daily/weekly/monthly
    care routines (meds, hydration, appointments) without a cron dependency.
    """
    reminder = _get_owned_reminder(reminder_id, user["uid"])
    firebase_service.update_document(
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
            next_id = firebase_service.add_document("reminders", next_data)
            next_reminder = {"reminder_id": next_id, **next_data}

    return {"completed": True, "next_reminder": next_reminder}


@router.delete("/{reminder_id}")
def delete_reminder(reminder_id: str, user=Depends(get_current_user)):
    _get_owned_reminder(reminder_id, user["uid"])
    firebase_service.delete_document("reminders", reminder_id)
    return {"deleted": True, "reminder_id": reminder_id}
