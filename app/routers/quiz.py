from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime
from app.services import firebase_service, quiz_service
from app.services.auth_dependency import get_current_user
from app.limiter import limiter
from app.config import settings

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

Difficulty = Literal["easy", "medium", "hard"]


@router.post("/generate")
@limiter.limit(settings.RATE_LIMIT_DEFAULT)
def generate_quiz(request: Request, memory_id: str, difficulty: Difficulty = "medium", user=Depends(get_current_user)):
    """
    Step 8: verified memory -> cognitive activity questions.
    Difficulty defaults to medium; frontend should pass the user's current
    difficulty level (from their progress doc) once that's wired in.

    SECURITY:
    - memory ownership is checked before any content is returned - without
      this, any authenticated user could pass another family's memory_id
      and read their private photo context via the quiz payload.
    - difficulty is constrained to a Literal (was a free string) - an
      arbitrary value here would silently break next_difficulty's index
      lookup logic and pollute stored quiz_attempts with junk values.
    - each generated question is persisted server-side (quiz_questions
      collection) keyed by question_id, with its correct_answer. The client
      submission later references question_id only - it can never supply
      its own correct_answer and have it trusted (see submit_quiz_answer).
    """
    memory = firebase_service.get_document("memories", memory_id)
    if not memory:
        return {"error": "Memory not found"}

    if memory.get("user_id") != user["uid"]:
        return {"error": "Not authorized to access this memory"}

    memory["memory_id"] = memory_id
    questions = quiz_service.generate_questions(memory, difficulty)

    client_questions = []
    for q in questions:
        firebase_service.add_document(
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
        # Don't ship the answer key to the client for free-text question types.
        # MCQ types leave it in "options" anyway (unavoidable), but we still
        # drop the explicit correct_answer field for consistency.
        client_q = {k: v for k, v in q.items() if k != "correct_answer"}
        client_questions.append(client_q)

    return {"memory_id": memory_id, "difficulty": difficulty, "questions": client_questions}


@router.get("/generate-sequence")
@limiter.limit(settings.RATE_LIMIT_DEFAULT)
def generate_sequence_quiz(request: Request, limit: int = 5, user=Depends(get_current_user)):
    """
    Sequence activity: pulls the user's N most recent verified memories and
    asks them to put them in chronological order. Needs at least 2 memories
    with created_at set (added at save time in memories.py).

    limit is bounded below (see clamp) - an unbounded/negative value could
    otherwise be used to force pathological sorts or huge query slices.

    SECURITY: correct_order is persisted server-side keyed by question_id,
    same as generate_quiz, so submit can't be spoofed by the client.
    """
    limit = max(2, min(limit, 20))  # clamp to a sane range regardless of client input

    memories = firebase_service.query_by_field("memories", "user_id", user["uid"])
    memories = [m for m in memories if m.get("created_at")]

    if len(memories) < 2:
        return {"error": "Need at least 2 verified memories with timestamps to build a sequence question."}

    recent = sorted(memories, key=lambda m: m["created_at"], reverse=True)[:limit]
    question = quiz_service.generate_sequence_question(recent)

    if question is None:
        return {"error": "Could not generate a sequence question from available memories."}

    firebase_service.add_document(
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
    response_time: float
    difficulty: Difficulty = "medium"


@router.post("/submit")
@limiter.limit(settings.RATE_LIMIT_DEFAULT)
def submit_quiz_answer(request: Request, submission: QuizSubmission, user=Depends(get_current_user)):
    """
    Step 9: record performance. This is what feeds the recall loop -
    weak areas get identified here and repeated later (spaced recall).

    SECURITY: correctness is graded against the server-stored question
    (looked up by question_id, ownership-checked), never against a
    client-supplied correct_answer. This closes a self-grading exploit
    where a client could just echo back whatever it wanted graded correct.
    Each question_id can only be submitted once to stop replaying it after
    seeing feedback from a first, exploratory attempt.
    """
    question = firebase_service.get_document("quiz_questions", submission.question_id)
    if not question:
        return {"error": "Question not found or expired"}

    if question.get("user_id") != user["uid"]:
        return {"error": "Not authorized to answer this question"}

    if question.get("used"):
        return {"error": "This question has already been answered"}

    correct_answer = question["correct_answer"]
    memory_id = question.get("memory_id")

    if isinstance(correct_answer, list):
        # sequence-type question: given_answer expected as comma-separated ids
        given_order = [x.strip() for x in submission.given_answer.split(",")]
        correct = given_order == correct_answer
    else:
        correct = submission.given_answer.strip().lower() == str(correct_answer).strip().lower()

    firebase_service.update_document("quiz_questions", submission.question_id, {"used": True})

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
    attempt_id = firebase_service.add_document("quiz_attempts", attempt)

    # Update rolling accuracy for adaptive difficulty (Step 10).
    # Sorted explicitly by timestamp - Firestore query order is not
    # guaranteed to be chronological, so slicing without sorting first
    # could silently use the wrong 10 attempts.
    recent_attempts = firebase_service.query_by_field("quiz_attempts", "user_id", user["uid"])
    recent_attempts = sorted(recent_attempts, key=lambda a: a.get("timestamp", ""))
    recent = recent_attempts[-10:] if len(recent_attempts) > 10 else recent_attempts
    recent_accuracy = sum(1 for a in recent if a.get("correct")) / len(recent) if recent else 0.5
    next_diff = quiz_service.next_difficulty(submission.difficulty, recent_accuracy)

    return {
        "attempt_id": attempt_id,
        "correct": correct,
        "recent_accuracy": round(recent_accuracy, 2),
        "next_difficulty": next_diff,
    }


@router.get("/weak-memories")
def get_weak_memories(user=Depends(get_current_user)):
    """
    Identifies memories where the user has been getting questions wrong -
    these should resurface later (delayed/spaced recall, Step 10).
    """
    attempts = firebase_service.query_by_field("quiz_attempts", "user_id", user["uid"])

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
