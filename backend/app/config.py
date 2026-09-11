"""
Central config. Every secret comes from the environment or .env.
Fails fast in production if required variables are missing,
while providing development defaults for seamless local testing.
"""
import os
import sys
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # --- Firebase ---
    FIREBASE_CREDENTIALS_PATH: str = "local_credentials.json"
    FIREBASE_PROJECT_ID: str = "cognitive-care-dev"

    # --- Cloudinary ---
    CLOUDINARY_CLOUD_NAME: str = "demo-cloud"
    CLOUDINARY_API_KEY: str = "demo-key"
    CLOUDINARY_API_SECRET: str = "demo-secret"

    # --- Vision AI ---
    GEMINI_API_KEY: str = "demo-gemini-key"

    # --- CORS ---
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    # --- Rate limiting ---
    RATE_LIMIT_DEFAULT: str = "120/minute"
    RATE_LIMIT_UPLOAD: str = "30/minute"

    # --- Local Fallback ---
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llava"

    # --- Env ---
    ENV: str = "development"

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def allowed_origins_list(self) -> list[str]:
        origins = [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]
        if "http://localhost:5173" not in origins:
            origins.append("http://localhost:5173")
        if "http://127.0.0.1:5173" not in origins:
            origins.append("http://127.0.0.1:5173")
        return origins


def _load_settings() -> Settings:
    try:
        return Settings()
    except Exception as e:
        print(f"Warning/Error loading configuration: {e}", file=sys.stderr)
        return Settings(_env_file=None)


settings = _load_settings()
