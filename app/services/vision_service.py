"""
Step 4-5 of the workflow: AI generates a HYPOTHESIS from an uploaded photo,
never a final memory.

DECISION (this session): reverted from the local-Ollama/llava plan back to
Gemini (cloud) as the ONLY vision path. Running a local vision-language
model needs a GPU (or a very patient CPU) that isn't available for this
build, so "offline/local AI" as originally scoped is not realistic here.

Honest tradeoff: this makes photo analysis require internet connectivity.
If "offline support" still needs to be true in your pitch, be explicit that
it now means "reminders/quiz/memory browsing work offline, photo analysis
needs a connection" rather than fully offline AI - don't claim more than
this code does.

Reliability measures given this is now a hard dependency on a 3rd-party
cloud API: a fast timeout (never hang a demo), graceful JSON-parse
fallback, and a safe default hypothesis if Gemini is unreachable or
misconfigured so the rest of the flow (face detection, human review) can
still proceed even if the vision hypothesis comes back empty.
"""
import json
import google.generativeai as genai
from app.config import settings

GEMINI_MODEL = "gemini-3.6-flash"  # fast + cheap, good fit for a real-time upload flow
GEMINI_TIMEOUT_S = 12  # fail fast rather than hang a demo on a slow/stuck request

PROMPT = """You are analyzing a personal family photo to help build a memory-recall
system for an elderly person. Look at the image and respond with ONLY valid JSON,
no markdown fences, no extra text, in exactly this shape:

{
  "scene": "short scene description e.g. beach, home, park",
  "activity": "what the people appear to be doing",
  "location_hint": "best guess at location, or null if unclear",
  "objects": ["list", "of", "notable", "objects"],
  "people_count": <integer>,
  "context": "one sentence guess about the occasion/context",
  "confidence": <float between 0 and 1>
}

This is a HYPOTHESIS to be verified by the family - be honest about uncertainty,
lower confidence when the image is ambiguous. Never invent specific names."""

_configured = False


def _ensure_configured():
    global _configured
    if not _configured:
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set.")
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _configured = True


def analyze_photo(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    if not settings.GEMINI_API_KEY:
        return _fallback_hypothesis("No Gemini API key configured.")

    try:
        _ensure_configured()
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(
            [PROMPT, {"mime_type": mime_type, "data": image_bytes}],
            request_options={"timeout": GEMINI_TIMEOUT_S},
        )
        text = response.text.strip().strip("```json").strip("```").strip()
        result = json.loads(text)
        result["source"] = "cloud"
        return result
    except json.JSONDecodeError as e:
        print(f"Gemini returned non-JSON response: {e}")
        return _fallback_hypothesis("AI response could not be parsed. Please fill in details manually.")
    except Exception as e:
        print(f"Gemini analysis failed: {e}")
        return _fallback_hypothesis("Could not analyze image automatically - AI may be rate-limited, offline, or unreachable.")


def _fallback_hypothesis(reason: str) -> dict:
    """
    Used if no API key set, no connectivity, rate-limited, or the call fails.
    Keeps the rest of the flow (face suggestions, human review, save) working
    even when the vision hypothesis itself couldn't be generated.
    """
    return {
        "scene": "unknown",
        "activity": "unknown",
        "location_hint": None,
        "objects": [],
        "people_count": 0,
        "context": f"{reason}",
        "confidence": 0.0,
        "source": "none",
    }
