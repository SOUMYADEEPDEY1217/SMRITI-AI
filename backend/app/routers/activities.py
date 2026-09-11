"""
Activity management and session result scoring for all 10 cognitive activities.
Integrates directly with quiz_service.next_difficulty for rule-based adaptive pacing.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from app.services import firebase_service, quiz_service
from app.services.auth_dependency import get_current_user

router = APIRouter(prefix="/api/activities", tags=["activities"])

# Standard 10 Cognitive Activities
ACTIVITIES_CATALOG = [
    {"id": "memory-garden", "title": "Memory Garden", "category": "Visual Recall", "estimatedTime": "3 mins", "domain": "visualMemory"},
    {"id": "familiar-face", "title": "Familiar Face", "category": "Social Recall", "estimatedTime": "3 mins", "domain": "faceRecognition"},
    {"id": "lifestory", "title": "LifeStory", "category": "Autobiographical", "estimatedTime": "4 mins", "domain": "semanticKnowledge"},
    {"id": "memory-radio", "title": "Memory Radio", "category": "Auditory Recall", "estimatedTime": "4 mins", "domain": "auditoryMemory"},
    {"id": "daily-companion", "title": "Daily Companion", "category": "Orientation & Routine", "estimatedTime": "3 mins", "domain": "temporalOrientation"},
    {"id": "memory-walk", "title": "Memory Walk", "category": "Spatial Navigation", "estimatedTime": "4 mins", "domain": "sequentialMemory"},
    {"id": "culture-quest", "title": "Culture Quest", "category": "Cultural Knowledge", "estimatedTime": "3 mins", "domain": "semanticKnowledge"},
    {"id": "recall-loop", "title": "Recall Loop", "category": "Short-Term Delayed", "estimatedTime": "4 mins", "domain": "delayedRecall"},
    {"id": "family-puzzle", "title": "Family Puzzle", "category": "Visuospatial", "estimatedTime": "4 mins", "domain": "patternMatching"},
    {"id": "cognitive-fingerprint", "title": "Cognitive Fingerprint", "category": "Holistic Profile", "estimatedTime": "5 mins", "domain": "all"},
]

DEFAULT_DOMAINS = {
    "visualMemory": 85,
    "auditoryMemory": 78,
    "faceRecognition": 92,
    "temporalOrientation": 84,
    "sequentialMemory": 75,
    "semanticKnowledge": 88,
    "delayedRecall": 70,
    "patternMatching": 82,
}


class ActivityResultPayload(BaseModel):
    patient_id: str
    activity_id: str
    activity_name: str
    score: int = Field(..., ge=0, le=100)
    accuracy: int = Field(..., ge=0, le=100)
    mistakes: int = Field(default=0, ge=0)
    correct_answers: int = Field(default=1, ge=0)
    response_time_sec: float = Field(default=4.0, ge=0)
    difficulty: str = "medium"


@router.get("/list")
def list_activities():
    """Returns the official catalog of 10 Cognitive Care activities."""
    return ACTIVITIES_CATALOG


@router.post("/result")
def record_activity_result(payload: ActivityResultPayload, user=Depends(get_current_user)):
    """
    Records an activity completion session, evaluates adaptive difficulty
    using quiz_service.next_difficulty, and updates Cognitive Fingerprint domains.
    """
    patient_id = payload.patient_id or user.get("uid", "patient-1")
    current_diff = payload.difficulty.lower()
    if current_diff not in ["easy", "medium", "hard"]:
        current_diff = "medium"

    # Evaluate adaptive difficulty using backend rule-based engine
    accuracy_ratio = payload.accuracy / 100.0
    next_diff = quiz_service.next_difficulty(current_diff, accuracy_ratio)

    if next_diff == current_diff:
        change = "same"
        message = "Challenge level is well-matched to your comfortable pace."
    elif quiz_service.DIFFICULTY_LEVELS.index(next_diff) > quiz_service.DIFFICULTY_LEVELS.index(current_diff):
        change = "increase"
        message = "Exceptional focus! Next session will introduce richer details."
    else:
        change = "decrease"
        message = "Next exercise will offer gentle guidance to keep practice relaxing."

    session_data = {
        "session_id": f"sess-{datetime.utcnow().timestamp()}",
        "patient_id": patient_id,
        "user_id": user.get("uid"),
        "activity_id": payload.activity_id,
        "activity_name": payload.activity_name,
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "timestamp": datetime.utcnow().isoformat(),
        "score": payload.score,
        "accuracy": payload.accuracy,
        "mistakes": payload.mistakes,
        "correct_answers": payload.correct_answers,
        "response_time_sec": payload.response_time_sec,
        "difficulty": current_diff.capitalize(),
        "new_difficulty": next_diff.capitalize(),
        "difficulty_change": change,
        "feedback_note": message,
        "status": "Completed",
    }

    firebase_service.add_document("activity_sessions", session_data)

    # Update patient's cognitive domains
    activity_meta = next((a for a in ACTIVITIES_CATALOG if a["id"] == payload.activity_id), None)
    target_domain = activity_meta["domain"] if activity_meta else "visualMemory"

    domain_doc = firebase_service.get_document("cognitive_domains", patient_id) or DEFAULT_DOMAINS.copy()
    if target_domain in domain_doc:
        prev_val = domain_doc[target_domain]
        # Gentle rolling average
        domain_doc[target_domain] = int(prev_val * 0.8 + payload.score * 0.2)
        firebase_service.add_document("cognitive_domains", domain_doc, doc_id=patient_id)

    return {
        "session": session_data,
        "next_difficulty": next_diff.capitalize(),
        "difficulty_change": change,
        "feedback_note": message,
        "cognitive_domains": domain_doc,
    }


@router.get("/progress")
def get_patient_progress(patient_id: Optional[str] = None, user=Depends(get_current_user)):
    """
    Returns session history and 8-domain radar scores for progress display.
    """
    target_id = patient_id or user.get("uid", "patient-1")
    sessions = firebase_service.query_by_field("activity_sessions", "patient_id", target_id)
    domains = firebase_service.get_document("cognitive_domains", target_id) or DEFAULT_DOMAINS

    # Sort sessions by timestamp ascending
    sorted_sessions = sorted(sessions, key=lambda s: s.get("timestamp", ""))

    return {
        "patient_id": target_id,
        "total_sessions": len(sorted_sessions),
        "recent_sessions": sorted_sessions[-15:],
        "cognitive_domains": domains,
    }
