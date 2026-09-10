"""
App entrypoint. This is where the cross-cutting security controls live that
no individual router should have to reimplement:
  - CORS allowlist (never '*')
  - rate limiting (global default + stricter limits on AI/upload endpoints)
  - security response headers
  - a catch-all exception handler so internals never leak to the client
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import logging

from app.core.config import settings
from app.core.limiter import limiter
from app.api.routes import family, memories, quiz, reminders, accessibility, users

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")

app = FastAPI(title="AI Cognitive Care Platform")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- CORS: explicit allowlist only, never "*" (this API sits behind bearer auth) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


# --- Security headers on every response ---
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response


# --- Catch-all: never leak stack traces / internal errors to the client ---
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled error on {request.method} {request.url.path}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})


app.include_router(family.router)
app.include_router(memories.router)
app.include_router(quiz.router)
app.include_router(reminders.router)
app.include_router(accessibility.router)
app.include_router(users.router)


@app.get("/health")
def health():
    return {"status": "ok"}
