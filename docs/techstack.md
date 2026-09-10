# TECHSTACK.md

## Backend
- **FastAPI** — routers under `app/routers/`, Pydantic v2 models for
  request/response validation (max_length constraints on all user text
  fields to bound storage/cost).
- **Firebase Auth** — bearer token auth, verified via `firebase_service.verify_id_token`.
- **Firestore** — primary datastore (`firebase_service.py` wraps
  add/get/query/update; **`delete_document` needs to be added** for the new
  reminders DELETE endpoint if it isn't already there).
- **Cloudinary** — photo storage (chosen over Firebase Storage to avoid
  requiring the paid Blaze plan; free tier = 25GB, no card).

## AI / ML
- **Gemini 2.5 Flash** (cloud, PRIMARY vision path) — vision hypothesis
  generation, `GEMINI_API_KEY` required.
- **Ollama + llava** (local, FALLBACK only) — only reached if Gemini
  fails, times out, is rate-limited, or there's no connectivity. Requires
  Ollama installed and running with `ollama pull llava` done ahead of
  time. Not the primary path (a GPU-less/CPU-only machine will run this
  fallback slowly), but gives resilience against a Gemini quota hit or
  flaky connection mid-demo without depending on it day-to-day.
- **InsightFace** (`face_service.py`) — face embedding + matching for
  family member recognition, CPU mode (`ctx_id=-1`). Built and boot-tested.
  Uses `buffalo_l` (~300MB, heavier) by default — consider `buffalo_s`
  (smaller/faster, slightly less accurate) if enrollment/recognition
  feels slow on demo hardware.

## Config (`app/config.py`, current)
```python
GEMINI_API_KEY: str            # required, primary vision path
OLLAMA_URL: str = "http://localhost:11434"   # fallback, optional
OLLAMA_MODEL: str = "llava"                  # fallback, optional
```

## Why this stack for a hackathon
- Firebase/Firestore: fast auth + NoSQL setup, generous free tier.
- Cloudinary: sidesteps Firebase Storage's Blaze-plan requirement.
- Gemini primary + Ollama fallback: best of both — fast/high-quality by
  default, with a free, offline-capable safety net for demo day if the
  cloud call fails. Ollama's slower on CPU, which is exactly why it's the
  fallback and not the primary.
