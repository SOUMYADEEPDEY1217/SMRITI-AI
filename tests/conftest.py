"""Shared pytest fixtures for the SMRITI-AI test suite."""
import pytest

@pytest.fixture
def sample_memory():
    """A fully-verified memory dict, representative of what gets stored in Firestore."""
    return {
        "memory_id": "mem-goa-2023",
        "user_id": "test-uid-123",
        "people": ["Mom", "Dad", "Sister Priya"],
        "location": "Goa beach",
        "activity": "swimming and building sandcastles",
        "event": "Summer vacation 2023",
        "objects": ["surfboard", "beach umbrella", "coconut water"],
        "scene": "beach",
        "story": "We stayed at a small hotel and ate fresh fish by the sea every evening.",
        "verified": True,
        "created_at": "2023-06-10T10:00:00",
    }

@pytest.fixture
def gemini_hypothesis():
    """A raw Gemini vision analysis output (before patient verification)."""
    return {
        "scene": "beach",
        "activity": "posing for a family photo on the ocean shore",
        "location_hint": "tropical beach, possibly in Hawaii",
        "objects": ["blue tie-dye dress", "ocean waves", "palm trees"],
        "people_count": 3,
        "context": "A sunny family vacation day spending time together at the seaside.",
        "confidence": 0.92,
        "source": "cloud",
    }

@pytest.fixture
def sample_image_bytes():
    """Returns the bytes of the test vacation photo."""
    import pathlib
    img_path = pathlib.Path(__file__).parent / "fixtures" / "vacation_family.jpg"
    if not img_path.exists():
        pytest.skip("Test image fixture not found. Run: pytest tests/ (image is auto-generated on first run)")
    return img_path.read_bytes()
