"""
Admin Management Router for Cognitive Care platform.
Provides full CRUD capabilities for Patients, Clinicians, Activities, Questions, and Media assets.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from app.services import firebase_service
from app.services.auth_dependency import get_current_user
from app.routers.activities import ACTIVITIES_CATALOG
import uuid

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Default seeded admin datasets
DEFAULT_QUESTIONS = [
    {
        "id": "q-1",
        "activityId": "memory-garden",
        "question": "Which flower was blooming with bright red petals?",
        "options": ["Bright Red Rose", "Blue Lotus", "White Lily", "Purple Orchid"],
        "correct": "Bright Red Rose",
        "difficulty": "Easy",
    },
    {
        "id": "q-2",
        "activityId": "memory-radio",
        "question": "Which classical string instrument was playing the soothing melody?",
        "options": ["Sitar", "Violin", "Veena", "Guitar"],
        "correct": "Sitar",
        "difficulty": "Medium",
    },
    {
        "id": "q-3",
        "activityId": "culture-quest",
        "question": "During which grand autumn festival are glowing clay diyas placed outside every doorway?",
        "options": ["Diwali", "Holi", "Bihu", "Navratri"],
        "correct": "Diwali",
        "difficulty": "Easy",
    },
]

DEFAULT_MEDIA = {
    "photos": [
        {"id": "photo-1", "title": "Golden Garden Blooms", "category": "Nature", "dateAdded": "2026-09-01"},
        {"id": "photo-2", "title": "Family Harvest Celebration", "category": "Family", "dateAdded": "2026-09-02"},
        {"id": "photo-3", "title": "Heritage Riverside Ghats", "category": "Landmark", "dateAdded": "2026-09-04"},
    ],
    "audio": [
        {"id": "audio-1", "title": "Morning Raga Bhairav (Flute)", "duration": "0:45", "type": "Instrumental"},
        {"id": "audio-2", "title": "Peaceful Evening Sitar Medley", "duration": "0:50", "type": "Classical"},
        {"id": "audio-3", "title": "Harmonium Folk Rhythm", "duration": "0:40", "type": "Tradition"},
    ],
}


# --- Patient CRUD ---
@router.get("/patients")
def get_all_patients(user=Depends(get_current_user)):
    patients = firebase_service.query_all("patients")
    return patients


@router.post("/patients")
def create_patient(data: dict, user=Depends(get_current_user)):
    patient_id = data.get("id") or f"patient-{uuid.uuid4().hex[:6]}"
    data["id"] = patient_id
    firebase_service.add_document("patients", data, doc_id=patient_id)
    return {"status": "success", "patient": data}


@router.patch("/patients/{patient_id}")
def update_patient(patient_id: str, changes: dict, user=Depends(get_current_user)):
    firebase_service.update_document("patients", patient_id, changes)
    return {"status": "success"}


@router.delete("/patients/{patient_id}")
def delete_patient(patient_id: str, user=Depends(get_current_user)):
    firebase_service.delete_document("patients", patient_id)
    return {"status": "success"}


# --- Staff CRUD ---
@router.get("/staff")
def get_all_staff(user=Depends(get_current_user)):
    staff = firebase_service.query_all("staff")
    if not staff:
        default_staff = [
            {"id": "doc-1", "name": "Dr. Ananya Sharma", "role": "Senior Geriatric Neurologist", "email": "ananya@cognitivecare.com"},
            {"id": "doc-2", "name": "Nurse Priya Patel", "role": "Cognitive Care Coordinator", "email": "priya@cognitivecare.com"},
        ]
        for s in default_staff:
            firebase_service.add_document("staff", s, doc_id=s["id"])
        return default_staff
    return staff


@router.post("/staff")
def create_staff(data: dict, user=Depends(get_current_user)):
    staff_id = data.get("id") or f"staff-{uuid.uuid4().hex[:6]}"
    data["id"] = staff_id
    firebase_service.add_document("staff", data, doc_id=staff_id)
    return {"status": "success", "staff": data}


@router.delete("/staff/{staff_id}")
def delete_staff(staff_id: str, user=Depends(get_current_user)):
    firebase_service.delete_document("staff", staff_id)
    return {"status": "success"}


# --- Activities CRUD ---
@router.get("/activities")
def get_activities_admin(user=Depends(get_current_user)):
    return ACTIVITIES_CATALOG


@router.patch("/activities/{activity_id}")
def update_activity_admin(activity_id: str, changes: dict, user=Depends(get_current_user)):
    firebase_service.update_document("activities", activity_id, changes)
    return {"status": "success"}


# --- Questions CRUD ---
@router.get("/questions")
def get_questions_admin(user=Depends(get_current_user)):
    questions = firebase_service.query_all("questions")
    if not questions:
        for q in DEFAULT_QUESTIONS:
            firebase_service.add_document("questions", q, doc_id=q["id"])
        return DEFAULT_QUESTIONS
    return questions


@router.post("/questions")
def create_question_admin(data: dict, user=Depends(get_current_user)):
    q_id = data.get("id") or f"q-{uuid.uuid4().hex[:6]}"
    data["id"] = q_id
    firebase_service.add_document("questions", data, doc_id=q_id)
    return {"status": "success", "question": data}


@router.delete("/questions/{question_id}")
def delete_question_admin(question_id: str, user=Depends(get_current_user)):
    firebase_service.delete_document("questions", question_id)
    return {"status": "success"}


# --- Media Management ---
@router.get("/media")
def get_media_admin(user=Depends(get_current_user)):
    return DEFAULT_MEDIA
