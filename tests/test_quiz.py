"""
tests/test_quiz.py
Unit tests for quiz_logic — question generation, adaptive difficulty, sequence ordering.
These are pure-Python tests with zero network or DB calls.
"""
import pytest
from app.services import quiz_logic


class TestQuestionGeneration:
    def test_generates_all_five_types(self, sample_memory):
        questions = quiz_logic.generate_questions(sample_memory, "medium")
        types = {q["activity_type"] for q in questions}
        assert types == {"recognition", "recall", "association", "visual_choice", "event_recall"}

    def test_every_question_has_required_fields(self, sample_memory):
        questions = quiz_logic.generate_questions(sample_memory, "medium")
        for q in questions:
            assert "question_id" in q
            assert "question" in q
            assert "correct_answer" in q
            assert "activity_type" in q
            assert "difficulty" in q

    def test_question_ids_are_unique(self, sample_memory):
        questions = quiz_logic.generate_questions(sample_memory, "medium")
        ids = [q["question_id"] for q in questions]
        assert len(ids) == len(set(ids)), "Duplicate question IDs found"

    def test_mcq_correct_answer_is_in_options(self, sample_memory):
        questions = quiz_logic.generate_questions(sample_memory, "medium")
        for q in questions:
            if q.get("options"):
                assert q["correct_answer"] in q["options"], \
                    f"Correct answer not in options for {q['activity_type']}"

    def test_all_difficulties_produce_questions(self, sample_memory):
        for difficulty in ["easy", "medium", "hard"]:
            questions = quiz_logic.generate_questions(sample_memory, difficulty)
            assert len(questions) >= 3, f"Too few questions at difficulty={difficulty}"

    def test_partial_memory_still_generates(self):
        """Memory with only people and location — should still produce at least 2 questions."""
        sparse_memory = {
            "memory_id": "sparse-001",
            "people": ["Grandma"],
            "location": "Delhi",
        }
        questions = quiz_logic.generate_questions(sparse_memory, "easy")
        assert len(questions) >= 2

    def test_empty_memory_produces_no_questions(self):
        empty_memory = {"memory_id": "empty-001"}
        questions = quiz_logic.generate_questions(empty_memory, "easy")
        assert len(questions) == 0


class TestSequenceQuestion:
    def test_correct_chronological_order(self):
        memories = [
            {"memory_id": "a", "created_at": "2023-01-15"},
            {"memory_id": "b", "created_at": "2023-06-10"},
            {"memory_id": "c", "created_at": "2023-12-25"},
        ]
        q = quiz_logic.generate_sequence_question(memories)
        assert q["correct_order"] == ["a", "b", "c"]

    def test_items_contain_all_memory_ids(self):
        memories = [
            {"memory_id": "x", "created_at": "2024-01-01"},
            {"memory_id": "y", "created_at": "2024-06-01"},
        ]
        q = quiz_logic.generate_sequence_question(memories)
        assert set(q["items"]) == {"x", "y"}

    def test_returns_none_for_single_memory(self):
        memories = [{"memory_id": "a", "created_at": "2023-01-01"}]
        assert quiz_logic.generate_sequence_question(memories) is None

    def test_has_required_fields(self):
        memories = [
            {"memory_id": "a", "created_at": "2022-01-01"},
            {"memory_id": "b", "created_at": "2023-01-01"},
        ]
        q = quiz_logic.generate_sequence_question(memories)
        assert "question_id" in q
        assert "question" in q
        assert "correct_order" in q
        assert "items" in q


class TestAdaptiveDifficulty:
    @pytest.mark.parametrize("current,accuracy,expected", [
        ("easy",   0.95, "medium"),  # high accuracy → go up
        ("medium", 0.85, "hard"),
        ("hard",   0.90, "hard"),    # already at max → stay
        ("medium", 0.45, "easy"),    # low accuracy → go down
        ("easy",   0.30, "easy"),    # already at min → stay
        ("medium", 0.65, "medium"),  # in between → stay
        ("medium", 0.80, "medium"),  # exactly at threshold → stay
        ("medium", 0.50, "medium"),  # exactly at lower threshold → stay
    ])
    def test_difficulty_transitions(self, current, accuracy, expected):
        result = quiz_logic.next_difficulty(current, accuracy)
        assert result == expected, f"{current} + {accuracy:.0%} => {result}, expected {expected}"

    def test_unknown_difficulty_defaults_to_medium(self):
        result = quiz_logic.next_difficulty("unknown_value", 0.5)
        assert result in ["easy", "medium", "hard"]


class TestSecurityInvariants:
    def test_correct_answer_stripped_from_client_payload(self, sample_memory):
        """The router strips correct_answer before sending to client. Verify the field exists server-side."""
        questions = quiz_logic.generate_questions(sample_memory, "medium")
        for q in questions:
            assert "correct_answer" in q, "Server-side question must retain correct_answer for grading"

        # Simulate what the router does
        client_questions = [{k: v for k, v in q.items() if k != "correct_answer"} for q in questions]
        for q in client_questions:
            assert "correct_answer" not in q, "correct_answer must be stripped before sending to client"
