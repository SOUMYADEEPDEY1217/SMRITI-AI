"""
Central config. Every secret comes from the environment - NOTHING is
hardcoded here, and nothing should ever be committed with real values.

SECURITY: fails fast at import time if a required variable is missing,
rather than letting the app boot into a half-configured, insecure state
and fail confusingly later (e.g. silently skipping auth verification).
"""
import os
import sys
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # --- Firebase ---
    FIREBASE_CREDENTIALS_PATH: str  # path to service account JSON, never checked into git
    FIREBASE_PROJECT_ID: str

    # --- Cloudinary ---
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    # --- Vision AI ---
    # Gemini is the ONLY vision path in this build - no local model, since
    # local LLaVA-class inference isn't feasible on the available compute.
    GEMINI_API_KEY: str

    # --- CORS ---
    # Comma-separated list of allowed origins, e.g. "https://app.example.com,https://staging.example.com"
    # Never default this to "*" - that would allow any website to call the API
    # using a logged-in user's browser session.
    ALLOWED_ORIGINS: str = ""

    # --- Rate limiting ---
    RATE_LIMIT_DEFAULT: str = "60/minute"
    RATE_LIMIT_UPLOAD: str = "10/minute"  # analyze/enroll - expensive AI/storage calls

    # --- Local Fallback ---
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llava"

    # --- Env ---
    ENV: str = "development"

    class Config:
        env_file = ".env"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


def _load_settings() -> Settings:
    try:
        return Settings()
    except Exception as e:
        # Fail fast and loud - never let the app start in a misconfigured
        # state where, e.g., Firebase credentials silently don't verify.
        print(f"FATAL: missing/invalid configuration: {e}", file=sys.stderr)
        raise SystemExit(1)


settings = _load_settings()

if not settings.allowed_origins_list and os.getenv("ENV", "development") == "production":
    print("FATAL: ALLOWED_ORIGINS must be set in production - refusing to boot with no CORS allowlist.", file=sys.stderr)
    raise SystemExit(1)
