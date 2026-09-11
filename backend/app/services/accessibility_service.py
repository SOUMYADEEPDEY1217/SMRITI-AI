import io
from gtts import gTTS
import google.generativeai as genai
from app.config import settings

_gemini_configured = False

def _ensure_gemini_configured():
    global _gemini_configured
    if not _gemini_configured:
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set.")
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _gemini_configured = True

def translate_text(text: str, target_lang: str) -> str:
    """
    Translates text to the specified target language using Gemini.
    E.g. target_lang = 'Hindi', 'Gujarati', 'Marathi', etc.
    """
    if not settings.GEMINI_API_KEY:
        print("Warning: GEMINI_API_KEY not set. Returning original text.")
        return text

    try:
        _ensure_gemini_configured()
        model = genai.GenerativeModel("gemini-3.6-flash")
        prompt = (
            f"Translate the following text to {target_lang}. "
            f"Return ONLY the translated text, no quotes, no extra context:\n\n{text}"
        )
        response = model.generate_content(prompt, request_options={"timeout": 15})
        return response.text.strip()
    except Exception as e:
        print(f"Translation failed: {e}")
        return text  # Fallback to original text on failure

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
