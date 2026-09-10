"""
Unified AI service (combines vision and face detection logic).
"""
import json
import io
import base64
import requests
import numpy as np
from PIL import Image
import insightface
from google import genai
from google.genai import types as genai_types
from app.core.config import settings

# --- Vision (Gemini) ---
GEMINI_MODEL = "gemini-3.6-flash"
GEMINI_TIMEOUT_S = 45

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
        _configured = True


_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _ensure_configured()
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


def analyze_photo(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    if not settings.GEMINI_API_KEY:
        return _fallback_hypothesis("No Gemini API key configured.")

    try:
        client = _get_client()
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                PROMPT,
                genai_types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            ],
            config=genai_types.GenerateContentConfig(http_options=genai_types.HttpOptions(timeout=GEMINI_TIMEOUT_S * 1000)),
        )
        text = response.text.strip().strip("```json").strip("```").strip()
        result = json.loads(text)
        result["source"] = "cloud"
        return result
    except Exception as e:
        print(f"Gemini Analysis Failed: {e}. Falling back to LLaVA (Ollama)...")
        return _ollama_fallback(image_bytes, mime_type)

def _ollama_fallback(image_bytes: bytes, mime_type: str) -> dict:
    """Fallback to local LLaVA model via Ollama."""
    try:
        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        payload = {
            "model": settings.OLLAMA_MODEL,
            "prompt": PROMPT,
            "images": [b64_image],
            "stream": False,
            "format": "json"
        }
        resp = requests.post(
            f"{settings.OLLAMA_URL.rstrip('/')}/api/generate",
            json=payload,
            timeout=120
        )
        resp.raise_for_status()
        
        text = resp.json().get("response", "").strip()
        result = json.loads(text)
        result["source"] = "local"
        return result
    except Exception as e:
        print(f"LLaVA (Ollama) Fallback Failed: {e}")
        return _fallback_hypothesis("Both cloud (Gemini) and local (LLaVA) analysis failed.")


def _fallback_hypothesis(reason: str) -> dict:
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


# --- Face Recognition (InsightFace) ---
MAX_IMAGE_DIMENSION = 4096
MATCH_SIMILARITY_THRESHOLD = 0.55

_face_app = insightface.app.FaceAnalysis(name="buffalo_l")
_face_app.prepare(ctx_id=-1, det_size=(640, 640))


def _safe_decode(image_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes))
    img.verify()
    img = Image.open(io.BytesIO(image_bytes))
    if img.width > MAX_IMAGE_DIMENSION or img.height > MAX_IMAGE_DIMENSION:
        raise ValueError(f"Image exceeds max dimension of {MAX_IMAGE_DIMENSION}px.")
    img = img.convert("RGB")
    return np.array(img)[:, :, ::-1]


def get_face_embeddings(image_bytes: bytes) -> list[dict]:
    try:
        arr = _safe_decode(image_bytes)
    except Exception as e:
        print(f"Face embedding: rejected image ({e})")
        return []

    faces = _face_app.get(arr)
    return [
        {
            "embedding": f.embedding.tolist(),
            "bbox": f.bbox.tolist(),
            "det_score": float(f.det_score),
        }
        for f in faces
    ]


def average_embedding(embeddings: list[list[float]]) -> list[float]:
    return np.mean(np.array(embeddings), axis=0).tolist()


def match_face(embedding: list[float], known_members: list[dict]) -> dict | None:
    if not known_members:
        return None

    query = np.array(embedding)
    query = query / np.linalg.norm(query)

    best, best_sim = None, -1.0
    for member in known_members:
        candidate = np.array(member["embedding"])
        candidate = candidate / np.linalg.norm(candidate)
        sim = float(np.dot(query, candidate))
        if sim > best_sim:
            best, best_sim = member, sim

    if best_sim < MATCH_SIMILARITY_THRESHOLD:
        return None

    return {"member_id": best["member_id"], "name": best["name"], "similarity": round(best_sim, 3)}
