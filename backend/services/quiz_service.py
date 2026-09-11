"""
Turns a VERIFIED memory into cognitive activity questions.

This is plain templating, not ML - the memory already has structured,
human-verified fields (people, location, activity, event, story). We just
plug them into question templates. No dataset, no labelling, no training.

Activity types match the project spec (Step 8):
  recognition, recall, association, sequence, delayed_recall

SECURITY NOTE: every generated question gets a server-side question_id.
The correct_answer is never trusted from the client at grading time -
quiz.py persists it keyed by question_id and looks it up on submit.
"""
import random
import uuid

DIFFICULTY_LEVELS = ["easy", "medium", "hard"]


def generate_questions(memory: dict, difficulty: str = "medium") -> list[dict]:
    """
    memory: a verified memory dict with people[], location, activity, event, story, objects[]
    Returns a list of question dicts ready to send to the frontend.
    Skips a question type if the memory doesn't have the field it needs.
    Each question includes a unique question_id used for tamper-proof grading.
    """
    questions = []

    people = memory.get("people") or []
    location = memory.get("location")
    activity = memory.get("activity")
    event = memory.get("event")
    objects = memory.get("objects") or []

    # --- Recognition: "who is in this photo?" ---
    if people:
        person = random.choice(people)
        distractors = _generate_distractors(person, people, pool=["Dad", "Mom", "Son", "Daughter", "Uncle", "Aunt", "Grandma", "Grandpa"])
        questions.append({
            "question_id": str(uuid.uuid4()),
            "activity_type": "recognition",
            "question": "Who is standing in this photo with you?",
            "options": _shuffle([person] + distractors),
            "correct_answer": person,
            "difficulty": difficulty,
            "memory_id": memory.get("memory_id") or memory.get("_id"),
        })

    # --- Recall: "where did you go?" ---
    if location:
        questions.append({
            "question_id": str(uuid.uuid4()),
            "activity_type": "recall",
            "question": "Where did you go in this memory?",
            "options": None,  # free-text recall, harder than multiple choice
            "correct_answer": location,
            "difficulty": difficulty,
            "memory_id": memory.get("memory_id") or memory.get("_id"),
        })

    # --- Association: "what were you doing?" ---
    if activity:
        distractors = _generate_distractors(activity, [], pool=["Having food", "Walking", "Celebrating", "Resting", "Playing", "Talking"])
        questions.append({
            "question_id": str(uuid.uuid4()),
            "activity_type": "association",
            "question": "What were you doing in this photo?",
            "options": _shuffle([activity] + distractors),
            "correct_answer": activity,
            "difficulty": difficulty,
            "memory_id": memory.get("memory_id") or memory.get("_id"),
        })

    # --- Visual choice: "which object did you see?" ---
    if objects:
        target_obj = random.choice(objects)
        distractors = _generate_distractors(target_obj, objects, pool=["car", "dog", "cake", "book", "bicycle", "flower"])
        questions.append({
            "question_id": str(uuid.uuid4()),
            "activity_type": "visual_choice",
            "question": "Which of these did you see in that memory?",
            "options": _shuffle([target_obj] + distractors),
            "correct_answer": target_obj,
            "difficulty": difficulty,
            "memory_id": memory.get("memory_id") or memory.get("_id"),
        })

    # --- Event recall ---
    if event:
        questions.append({
            "question_id": str(uuid.uuid4()),
            "activity_type": "event_recall",
            "question": "What occasion was this?",
            "options": None,
            "correct_answer": event,
            "difficulty": difficulty,
            "memory_id": memory.get("memory_id") or memory.get("_id"),
        })

    return questions


def generate_sequence_question(memories: list[dict]) -> dict | None:
    """
    Given multiple memories (e.g. from the same trip/day), ask the user to
    order them. Needs at least 2 memories with timestamps/order.
    """
    if len(memories) < 2:
        return None
    ordered = sorted(memories, key=lambda m: m.get("created_at", ""))
    correct_order = [m.get("memory_id") or m.get("_id") for m in ordered]
    shuffled = correct_order.copy()
    random.shuffle(shuffled)
    return {
        "question_id": str(uuid.uuid4()),
        "activity_type": "sequence",
        "question": "Put these memories in the order they happened.",
        "items": shuffled,
        "correct_order": correct_order,
    }


def _generate_distractors(correct: str, exclude: list[str], pool: list[str], count: int = 2) -> list[str]:
    """Pick wrong-answer options that aren't the correct answer or already in the memory's own list."""
    candidates = [p for p in pool if p != correct and p not in exclude]
    random.shuffle(candidates)
    return candidates[:count]


def _shuffle(items: list[str]) -> list[str]:
    items = items.copy()
    random.shuffle(items)
    return items


# ---------- Adaptive difficulty (rule-based, per project spec Step 10) ----------

def next_difficulty(current_difficulty: str, recent_accuracy: float) -> str:
    """
    recent_accuracy: 0.0-1.0, from the last few attempts.
    Pure rule-based - no ML model.
    """
    idx = DIFFICULTY_LEVELS.index(current_difficulty) if current_difficulty in DIFFICULTY_LEVELS else 1

    if recent_accuracy > 0.8 and idx < len(DIFFICULTY_LEVELS) - 1:
        return DIFFICULTY_LEVELS[idx + 1]
    if recent_accuracy < 0.5 and idx > 0:
        return DIFFICULTY_LEVELS[idx - 1]
    return DIFFICULTY_LEVELS[idx]
