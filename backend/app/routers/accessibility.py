from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from app.services import accessibility_service
from app.services.auth_dependency import get_current_user
from app.limiter import limiter
from fastapi import Request

router = APIRouter(prefix="/api/accessibility", tags=["accessibility"])

class TranslateRequest(BaseModel):
    text: str
    target_lang: str

@router.post("/translate")
@limiter.limit("20/minute")
def translate_text(
    request: Request,
    payload: TranslateRequest,
    user=Depends(get_current_user),
):
    """
    Translate any text into a target Indian language (e.g., 'Hindi', 'Gujarati').
    Uses Gemini for accurate contextual translations.
    """
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    translated_text = accessibility_service.translate_text(payload.text, payload.target_lang)
    return {"original_text": payload.text, "translated_text": translated_text, "target_lang": payload.target_lang}

@router.get("/tts")
@limiter.limit("20/minute")
def generate_tts(
    request: Request,
    text: str = Query(..., description="Text to convert to speech"),
    lang_code: str = Query("hi", description="Language code (e.g., hi, bn, gu, mr, pa, ur)"),
    user=Depends(get_current_user),
):
    """
    Returns an audio/mpeg streaming response of the generated speech.
    Useful for plugging directly into an <audio src="..."> tag (with auth headers).
    """
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    try:
        audio_stream = accessibility_service.generate_audio(text, lang_code)
        return StreamingResponse(audio_stream, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
