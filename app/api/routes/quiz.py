from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, timedelta

from app.services import db_service, quiz_logic
from app.api.dependencies import get_current_user, get_doctor_user
from app.core.limiter import limiter
from app.core.config import settings

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

Difficulty = Literal["easy", "medium", "hard"]

# ---------------------------------------------------------------------------
# Patient Routes
# ---------------------------------------------------------------------------

@router.post("/generate")
@limiter.limit(settings.RATE_LIMIT_DEFAULT)
def generate_quiz(request: Request, memory_id: str, difficulty: Difficulty = "medium", user=Depends(get_current_user)):
    memory = db_service.get_document("memories", memory_id)
    if not memory:
        return {"error": "Memory not found"}
    if memory.get("user_id") != user["uid"]:
        return {"error": "Not authorized to access this memory"}

    memory["memory_id"] = memory_id
    questions = quiz_logic.generate_questions(memory, difficulty)

    client_questions = []
    for q in questions:
        db_service.add_document(
            "quiz_questions",
            {
                "question_id": q["question_id"],
                "user_id": user["uid"],
                "memory_id": memory_id,
                "activity_type": q["activity_type"],
                "correct_answer": q["correct_answer"],
                "difficulty": q["difficulty"],
                "created_at": datetime.utcnow().isoformat(),
                "used": False,
            },
            doc_id=q["question_id"],
        )
        client_q = {k: v for k, v in q.items() if k != "correct_answer"}
        client_questions.append(client_q)

    return {"memory_id": memory_id, "difficulty": difficulty, "questions": client_questions}


@router.get("/generate-sequence")
@limiter.limit(settings.RATE_LIMIT_DEFAULT)
def generate_sequence_quiz(request: Request, limit: int = 5, user=Depends(get_current_user)):
    limit = max(2, min(limit, 20))
    memories = db_service.query_by_field("memories", "user_id", user["uid"])
    memories = [m for m in memories if m.get("created_at")]

    if len(memories) < 2:
        return {"error": "Need at least 2 verified memories with timestamps to build a sequence question."}

    recent = sorted(memories, key=lambda m: m["created_at"], reverse=True)[:limit]
    question = quiz_logic.generate_sequence_question(recent)

    if question is None:
        return {"error": "Could not generate a sequence question from available memories."}

    db_service.add_document(
        "quiz_questions",
        {
            "question_id": question["question_id"],
            "user_id": user["uid"],
            "memory_id": None,
            "activity_type": "sequence",
            "correct_answer": question["correct_order"],
            "difficulty": None,
            "created_at": datetime.utcnow().isoformat(),
            "used": False,
        },
        doc_id=question["question_id"],
    )

    client_question = {k: v for k, v in question.items() if k != "correct_order"}
    return client_question


class QuizSubmission(BaseModel):
    question_id: str
    given_answer: str
    response_time: float = Field(..., ge=0.0, le=3600.0, description="Elapsed seconds, clamped 0-3600")
    difficulty: Difficulty = "medium"


@router.post("/submit")
@limiter.limit(settings.RATE_LIMIT_DEFAULT)
def submit_quiz_answer(request: Request, submission: QuizSubmission, user=Depends(get_current_user)):
    question = db_service.get_document("quiz_questions", submission.question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found or expired")
    if question.get("user_id") != user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized to answer this question")
    if question.get("used"):
        raise HTTPException(status_code=409, detail="This question has already been answered")

    correct_answer = question["correct_answer"]
    memory_id = question.get("memory_id")

    if isinstance(correct_answer, list):
        given_order = [x.strip() for x in submission.given_answer.split(",")]
        correct = given_order == correct_answer
    else:
        correct = submission.given_answer.strip().lower() == str(correct_answer).strip().lower()

    db_service.update_document("quiz_questions", submission.question_id, {"used": True})

    attempt = {
        "question_id": submission.question_id,
        "memory_id": memory_id,
        "activity_type": question.get("activity_type"),
        "given_answer": submission.given_answer,
        "response_time": submission.response_time,
        "difficulty": submission.difficulty,
        "user_id": user["uid"],
        "correct": correct,
        "timestamp": datetime.utcnow().isoformat(),
    }
    attempt_id = db_service.add_document("quiz_attempts", attempt)

    recent_attempts = db_service.query_by_field("quiz_attempts", "user_id", user["uid"])
    recent_attempts = sorted(recent_attempts, key=lambda a: a.get("timestamp", ""))
    recent = recent_attempts[-10:] if len(recent_attempts) > 10 else recent_attempts
    recent_accuracy = sum(1 for a in recent if a.get("correct")) / len(recent) if recent else 0.5
    next_diff = quiz_logic.next_difficulty(submission.difficulty, recent_accuracy)

    return {
        "attempt_id": attempt_id,
        "correct": correct,
        "recent_accuracy": round(recent_accuracy, 2),
        "next_difficulty": next_diff,
    }


@router.get("/weak-memories")
def get_weak_memories(user=Depends(get_current_user)):
    """Patient viewing their own weak memories."""
    attempts = db_service.query_by_field("quiz_attempts", "user_id", user["uid"])

    by_memory: dict[str, list[bool]] = {}
    for a in attempts:
        if not a.get("memory_id"):
            continue
        by_memory.setdefault(a["memory_id"], []).append(a["correct"])

    weak = [
        {"memory_id": mid, "accuracy": round(sum(results) / len(results), 2), "attempts": len(results)}
        for mid, results in by_memory.items()
        if sum(results) / len(results) < 0.5
    ]
    return sorted(weak, key=lambda w: w["accuracy"])


# ---------------------------------------------------------------------------
# Doctor Routes
# ---------------------------------------------------------------------------

@router.get("/doctor/patients/{patient_uid}/progress")
def patient_progress(patient_uid: str, days: int = 30, doctor=Depends(get_doctor_user)):
    """Day-by-day accuracy breakdown for the last `days` days."""
    days = max(1, min(days, 90))
    attempts = db_service.query_by_field("quiz_attempts", "user_id", patient_uid)
    cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
    attempts = [a for a in attempts if a.get("timestamp", "") >= cutoff]

    by_day: dict[str, dict] = {}
    for a in attempts:
        ts = a.get("timestamp", "")
        try:
            day = ts[:10]  # "YYYY-MM-DD"
        except Exception:
            continue
        bucket = by_day.setdefault(day, {"date": day, "attempts": 0, "correct": 0})
        bucket["attempts"] += 1
        if a.get("correct"):
            bucket["correct"] += 1

    result = sorted(by_day.values(), key=lambda x: x["date"])
    for entry in result:
        entry["accuracy"] = round(entry["correct"] / entry["attempts"], 3) if entry["attempts"] else 0.0
    return result


@router.get("/doctor/patients/{patient_uid}/weak-memories")
def patient_weak_memories(patient_uid: str, doctor=Depends(get_doctor_user)):
    """Memories where the patient is getting quiz questions wrong most of the time (Doctor view with photo context)."""
    attempts = db_service.query_by_field("quiz_attempts", "user_id", patient_uid)

    by_memory: dict[str, list[bool]] = {}
    for a in attempts:
        mid = a.get("memory_id")
        if not mid:
            continue
        by_memory.setdefault(mid, []).append(bool(a.get("correct")))

    weak = []
    for mid, results in by_memory.items():
        accuracy = sum(results) / len(results)
        if accuracy < 0.5:
            mem = db_service.get_document("memories", mid)
            weak.append({
                "memory_id": mid,
                "accuracy": round(accuracy, 3),
                "attempts": len(results),
                "photo_url": mem.get("photo_url") if mem else None,
                "people": mem.get("people") if mem else [],
                "event": mem.get("event") if mem else None,
                "story": mem.get("story") if mem else None,
            })

    return sorted(weak, key=lambda w: w["accuracy"])


@router.get("/doctor/patients/{patient_uid}/history")
def patient_quiz_history(patient_uid: str, limit: int = 50, doctor=Depends(get_doctor_user)):
    """Recent quiz attempts for a patient, newest first."""
    limit = max(1, min(limit, 200))
    attempts = db_service.query_by_field("quiz_attempts", "user_id", patient_uid)
    attempts = sorted(attempts, key=lambda a: a.get("timestamp", ""), reverse=True)
    attempts = attempts[:limit]

    return [
        {
            "attempt_id": a.get("_id"),
            "memory_id": a.get("memory_id"),
            "activity_type": a.get("activity_type"),
            "difficulty": a.get("difficulty"),
            "correct": a.get("correct"),
            "response_time": a.get("response_time"),
            "timestamp": a.get("timestamp"),
        }
        for a in attempts
    ]
