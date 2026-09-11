"""
Clinician and Care Team Portal Router.
Provides patient roster, longitudinal trend inspection, domain radar mapping, and clinical notes.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.services import firebase_service
from app.services.auth_dependency import get_current_user
from app.routers.activities import DEFAULT_DOMAINS

router = APIRouter(prefix="/api/clinician", tags=["clinician"])

SAMPLE_PATIENTS = [
    {
        "id": "patient-1",
        "name": "Ramesh Patel",
        "age": 72,
        "gender": "Male",
        "primaryContact": "Aarav Patel (Son)",
        "adherenceRate": "92%",
        "recentScore": 88,
        "difficulty": "Medium",
        "riskLevel": "Low",
        "diagnosis": "Mild Cognitive Impairment (Observational)",
        "clinic": "Apollo Geriatric Memory Clinic",
        "notes": [
            {"date": "2026-09-08", "author": "Dr. Ananya Sharma", "text": "Patient demonstrated steady orientation on daily companion tasks. Continues to enjoy flower recall."},
            {"date": "2026-08-25", "author": "Nurse Priya", "text": "Auditory responses calm; reaction time reduced by 0.4 seconds."}
        ]
    },
    {
        "id": "patient-2",
        "name": "Sunita Sen",
        "age": 68,
        "gender": "Female",
        "primaryContact": "Rohit Sen (Husband)",
        "adherenceRate": "85%",
        "recentScore": 82,
        "difficulty": "Easy",
        "riskLevel": "Low",
        "diagnosis": "Early Stage Memory Support",
        "clinic": "Apollo Geriatric Memory Clinic",
        "notes": [
            {"date": "2026-09-02", "author": "Dr. Ananya Sharma", "text": "Strong narrative recall during LifeStory activities."}
        ]
    },
    {
        "id": "patient-3",
        "name": "Vikram Malhotra",
        "age": 79,
        "gender": "Male",
        "primaryContact": "Meera Malhotra (Daughter)",
        "adherenceRate": "74%",
        "recentScore": 65,
        "difficulty": "Easy",
        "riskLevel": "Moderate",
        "diagnosis": "Memory Recall Calibration Needed",
        "clinic": "Apollo Geriatric Memory Clinic",
        "notes": [
            {"date": "2026-09-05", "author": "Dr. Ananya Sharma", "text": "Mild hesitation on delayed recall loops; recommend remaining on Easy comfort baseline."}
        ]
    }
]

SAMPLE_SESSIONS = [
    {"date": "2026-09-01", "score": 78, "responseTimeSec": 5.1, "activityName": "Memory Garden"},
    {"date": "2026-09-03", "score": 82, "responseTimeSec": 4.8, "activityName": "Familiar Face"},
    {"date": "2026-09-05", "score": 80, "responseTimeSec": 4.4, "activityName": "Memory Radio"},
    {"date": "2026-09-07", "score": 88, "responseTimeSec": 4.0, "activityName": "Daily Companion"},
    {"date": "2026-09-09", "score": 86, "responseTimeSec": 3.8, "activityName": "Memory Walk"},
    {"date": "2026-09-10", "score": 92, "responseTimeSec": 3.5, "activityName": "Culture Quest"},
    {"date": "2026-09-11", "score": 90, "responseTimeSec": 3.7, "activityName": "Memory Garden"}
]


class ClinicalNotePayload(BaseModel):
    text: str = Field(..., min_length=2, max_length=1500)


class DifficultyUpdatePayload(BaseModel):
    difficulty: str = Field(..., pattern="^(Easy|Medium|Hard)$")


@router.get("/patients")
def list_patients(user=Depends(get_current_user)):
    """Returns patient roster for clinician dashboard."""
    stored_patients = firebase_service.query_all("patients")
    if not stored_patients:
        for p in SAMPLE_PATIENTS:
            firebase_service.add_document("patients", p, doc_id=p["id"])
        return SAMPLE_PATIENTS
    return stored_patients


@router.get("/patient/{patient_id}")
def get_patient_profile(patient_id: str, user=Depends(get_current_user)):
    """Returns full patient profile with longitudinal sessions, cognitive domains, and clinical notes."""
    patient = firebase_service.get_document("patients", patient_id)
    if not patient:
        patient = next((p for p in SAMPLE_PATIENTS if p["id"] == patient_id), SAMPLE_PATIENTS[0])

    # Retrieve real sessions from activity_sessions
    recorded_sessions = firebase_service.query_by_field("activity_sessions", "patient_id", patient_id)
    sessions = recorded_sessions if len(recorded_sessions) >= 3 else SAMPLE_SESSIONS

    # Retrieve cognitive domains
    domains = firebase_service.get_document("cognitive_domains", patient_id) or DEFAULT_DOMAINS

    return {
        "patient": patient,
        "sessions": sessions,
        "cognitive_domains": domains,
    }


@router.post("/patient/{patient_id}/notes")
def add_patient_note(patient_id: str, payload: ClinicalNotePayload, user=Depends(get_current_user)):
    """Appends an observation note to the patient profile."""
    patient = firebase_service.get_document("patients", patient_id)
    if not patient:
        patient = next((p for p in SAMPLE_PATIENTS if p["id"] == patient_id), SAMPLE_PATIENTS[0]).copy()

    notes = patient.get("notes", [])
    author_name = user.get("name") or "Dr. Ananya Sharma"
    new_note = {
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "author": author_name,
        "text": payload.text.strip(),
    }
    notes.insert(0, new_note)
    patient["notes"] = notes

    firebase_service.add_document("patients", patient, doc_id=patient_id)
    return {"status": "success", "notes": notes}


@router.patch("/patient/{patient_id}/difficulty")
def update_patient_difficulty(patient_id: str, payload: DifficultyUpdatePayload, user=Depends(get_current_user)):
    """Adjusts baseline difficulty level for a patient."""
    patient = firebase_service.get_document("patients", patient_id)
    if not patient:
        patient = next((p for p in SAMPLE_PATIENTS if p["id"] == patient_id), SAMPLE_PATIENTS[0]).copy()

    patient["difficulty"] = payload.difficulty
    firebase_service.add_document("patients", patient, doc_id=patient_id)
    return {"status": "success", "difficulty": payload.difficulty}
