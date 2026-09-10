import io
from gtts import gTTS
from google import genai
from app.core.config import settings

_client: genai.Client | None = None


def _get_gemini_client() -> genai.Client:
    global _client
    if _client is None:
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set.")
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client

def translate_text(text: str, target_lang: str) -> str:
    if not settings.GEMINI_API_KEY:
        print("Warning: GEMINI_API_KEY not set. Returning original text.")
        return text

    try:
        client = _get_gemini_client()
        prompt = (
            f"Translate the following text to {target_lang}. "
            f"Return ONLY the translated text, no quotes, no extra context:\n\n{text}"
        )
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        print(f"Translation failed: {e}")
        return text

def generate_audio(text: str, lang_code: str = "hi") -> io.BytesIO:
    """
    Generates TTS audio stream for the given text and language code.
    Supported North Indian gTTS codes: hi (Hindi), bn (Bengali), gu (Gujarati), 
    mr (Marathi), pa (Punjabi), ur (Urdu).
    """
    try:
        tts = gTTS(text=text, lang=lang_code, slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        return fp
    except Exception as e:
        print(f"TTS generation failed: {e}")
        raise RuntimeError("Failed to generate audio.")


def _build_narration(memory: dict) -> str:
    """
    Turns a structured memory dict into a warm, natural sentence in English.
    Works with both a freshly-analyzed hypothesis AND a fully-verified saved memory.
    """
    parts = []

    # People (from verified memory) or people_count (from Gemini hypothesis)
    people = memory.get("people") or []
    people_count = memory.get("people_count", 0)
    if people:
        if len(people) == 1:
            parts.append(f"You were with {people[0]}")
        else:
            parts.append(f"You were with {', '.join(people[:-1])} and {people[-1]}")
    elif people_count > 0:
        parts.append(f"You were with {people_count} other {'person' if people_count == 1 else 'people'}")

    # Location
    location = memory.get("location") or memory.get("location_hint")
    if location:
        parts.append(f"at {location}")

    # Activity
    activity = memory.get("activity")
    if activity:
        parts.append(f"and you were {activity}")

    # Scene / context
    scene = memory.get("scene")
    context = memory.get("context")
    if scene and scene != "unknown":
        parts.append(f"The setting was a {scene}")
    if context and context not in ("unknown", ""):
        parts.append(context)

    # Event
    event = memory.get("event")
    if event:
        parts.append(f"This was during {event}")

    # Story (the richest field — use it directly if present)
    story = memory.get("story")
    if story:
        parts.append(story)

    if not parts:
        return "This is one of your cherished memories."

    narration = ". ".join(parts)
    if not narration.endswith("."):
        narration += "."
    return narration


def narrate_memory(memory: dict, lang_code: str = "en", translate_to: str | None = None) -> io.BytesIO:
    """
    Takes a memory dict (from Gemini hypothesis or a verified saved memory)
    and returns an audio stream of the narration.

    Args:
        memory:       The memory dict. Can contain fields like:
                      people, location, activity, scene, context, event, story,
                      people_count, location_hint.
        lang_code:    gTTS language code for the final audio (default 'en' = English).
        translate_to: If set (e.g. 'Hindi'), the narration is first translated via Gemini
                      before being converted to speech.
    Returns:
        io.BytesIO MP3 audio stream.
    """
    narration = _build_narration(memory)

    if translate_to:
        narration = translate_text(narration, translate_to)

    return generate_audio(narration, lang_code)

