"""
App entrypoint for Cognitive Care / SMRITI-AI Platform.
Cross-cutting security controls:
  - CORS allowlist (including local Vite dev server port 5173)
  - Rate limiting
  - Security response headers
  - Catch-all exception handling
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import logging

from app.config import settings
from app.limiter import limiter
from app.routers import (
    auth,
    activities,
    clinician,
    admin,
    family_members,
    memories,
    quiz,
    reminders,
    accessibility,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")

app = FastAPI(title="Cognitive Care Platform API", version="2.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


# --- Security headers ---
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response


# --- Catch-all exception handler ---
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled error on {request.method} {request.url.path}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})


# Mount Routers
app.include_router(auth.router)
app.include_router(activities.router)
app.include_router(clinician.router)
app.include_router(admin.router)
app.include_router(family_members.router)
app.include_router(memories.router)
app.include_router(quiz.router)
app.include_router(reminders.router)
app.include_router(accessibility.router)


@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}
