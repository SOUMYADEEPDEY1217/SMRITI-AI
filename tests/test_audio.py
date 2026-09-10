"""
tests/test_audio.py
Unit tests for audio_logic — TTS generation and memory narration.
These tests do NOT require a running server or database.
"""
import io
import pytest
from app.services.audio_logic import generate_audio, narrate_memory, _build_narration


class TestNarrationBuilder:
    def test_narrates_full_verified_memory(self, sample_memory):
        text = _build_narration(sample_memory)
        assert "Mom" in text
        assert "Dad" in text
        assert "Goa beach" in text
        assert "swimming" in text
        assert "Summer vacation 2023" in text
        assert text.endswith(".")

    def test_narrates_gemini_hypothesis(self, gemini_hypothesis):
        text = _build_narration(gemini_hypothesis)
        assert "3 other people" in text
        assert "Hawaii" in text or "tropical" in text
        assert "seaside" in text or "beach" in text

    def test_single_person(self):
        memory = {"people": ["Grandma"], "location": "Mumbai"}
        text = _build_narration(memory)
        assert "Grandma" in text
        assert "Mumbai" in text
        # Should say "You were with Grandma" not "and Grandma"
        assert "You were with Grandma" in text

    def test_multiple_people_joined_correctly(self):
        memory = {"people": ["Mom", "Dad", "Uncle"]}
        text = _build_narration(memory)
        assert "Mom" in text and "Dad" in text and "Uncle" in text

    def test_empty_memory_returns_default(self):
        text = _build_narration({})
        assert len(text) > 0
        assert "cherished" in text.lower() or "memory" in text.lower()

    def test_story_field_is_included(self):
        memory = {"story": "We ate mango ice cream on the rooftop."}
        text = _build_narration(memory)
        assert "mango ice cream" in text

    def test_narration_ends_with_period(self, sample_memory):
        text = _build_narration(sample_memory)
        assert text.strip().endswith(".")


class TestAudioGeneration:
    def test_english_tts_produces_bytes(self, sample_memory):
        stream = narrate_memory(sample_memory, lang_code="en")
        data = stream.read()
        assert isinstance(stream, io.BytesIO)
        assert len(data) > 5000, "Audio stream too small to be valid MP3"

    def test_hindi_tts_produces_bytes(self):
        stream = generate_audio("नमस्ते, यह एक परीक्षण है।", lang_code="hi")
        data = stream.read()
        assert len(data) > 1000

    def test_audio_stream_is_seekable(self, sample_memory):
        stream = narrate_memory(sample_memory, lang_code="en")
        stream.seek(0)
        first_chunk = stream.read(4)
        assert len(first_chunk) == 4

    def test_narrate_gemini_hypothesis(self, gemini_hypothesis):
        """Even before a patient verifies a memory, we can narrate the AI hypothesis."""
        stream = narrate_memory(gemini_hypothesis, lang_code="en")
        data = stream.read()
        assert len(data) > 5000
