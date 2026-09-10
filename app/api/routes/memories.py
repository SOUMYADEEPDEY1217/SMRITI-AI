from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Request, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

from app.services import db_service, ai_service, storage_service, audio_logic
from app.api.dependencies import get_current_user, get_admin_user, get_doctor_user
from app.core.limiter import limiter
from app.core.config import settings

router = APIRouter(prefix="/api/memories", tags=["memories"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class VerifiedMemory(BaseModel):
    memory_id: str
    # NOTE: photo_url is intentionally NOT accepted from the client.
    # It is always read server-side from the pending_memories Firestore
    # document to prevent URL substitution / mass-assignment attacks.
    people: List[str] = Field(default_factory=list, max_length=20)
    location: Optional[str] = Field(default=None, max_length=200)
    activity: Optional[str] = Field(default=None, max_length=200)
    event: Optional[str] = Field(default=None, max_length=200)
    story: Optional[str] = Field(default=None, max_length=2000)
    scene: Optional[str] = Field(default=None, max_length=200)
    objects: List[str] = Field(default_factory=list, max_length=30)
    occurred_at: Optional[str] = None


class AdminMemoryDefinition(BaseModel):
    memory_id: str = Field(..., description="memory_id returned by /upload")
    people: List[str] = Field(default_factory=list, max_length=20)
    location: Optional[str] = Field(default=None, max_length=200)
    activity: Optional[str] = Field(default=None, max_length=200)
    event: Optional[str] = Field(default=None, max_length=200)
    story: Optional[str] = Field(default=None, max_length=2000)
    scene: Optional[str] = Field(default=None, max_length=200)
    objects: List[str] = Field(default_factory=list, max_length=30)
    occurred_at: Optional[str] = None


# ---------------------------------------------------------------------------
# Shared Internal Logic
# ---------------------------------------------------------------------------

async def _process_memory_upload(file: UploadFile, target_uid: str, uploader_uid: str, is_admin: bool = False):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WEBP images are allowed.")

    image_bytes = await file.read()

    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Image exceeds 10MB limit.")
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file.")

    memory_id = str(uuid.uuid4())
    content_type = file.content_type

    photo_url = storage_service.upload_photo(
        image_bytes, f"users/{target_uid}/memories/{memory_id}"
    )

    hypothesis = ai_service.analyze_photo(image_bytes, content_type)

    detected_faces = ai_service.get_face_embeddings(image_bytes)
    known_members = db_service.query_by_field("family_members", "user_id", target_uid)
    known_members = [{"member_id": m["_id"], "name": m["name"], "embedding": m["embedding"]} for m in known_members]

    face_suggestions = []
    for face in detected_faces:
        match = ai_service.match_face(face["embedding"], known_members)
        face_suggestions.append({
            "bbox": face["bbox"],
            "suggested_name": match["name"] if match else None,
            "member_id": match["member_id"] if match else None,
            "similarity": match["similarity"] if match else None,
        })

    hypothesis["faces_detected"] = len(detected_faces)

    pending_data = {
        "user_id": target_uid,
        "photo_url": photo_url,
        "created_at": datetime.utcnow().isoformat()
    }
    if is_admin:
        pending_data["uploaded_by_admin"] = uploader_uid

    db_service.add_document("pending_memories", pending_data, doc_id=memory_id)

    return {
        "memory_id": memory_id,
        "photo_url": photo_url,
        "hypothesis": hypothesis,
        "face_suggestions": face_suggestions,
    }


def _save_verified_memory(memory_id: str, payload_dict: dict, target_uid: str, definer_uid: str, is_admin: bool = False):
    pending = db_service.get_document("pending_memories", memory_id)
    if not pending or pending.get("user_id") != target_uid:
        raise HTTPException(status_code=403, detail="Not authorized or memory_id invalid.")

    existing = db_service.get_document("memories", memory_id)
    if existing and existing.get("user_id") != target_uid:
        raise HTTPException(status_code=403, detail="Not authorized to modify this memory.")

    data = {
        **payload_dict,
        "photo_url": pending["photo_url"],
        "user_id": target_uid,
        "verified": True,
        "created_at": datetime.utcnow().isoformat(),
    }
    if is_admin:
        data["defined_by_admin"] = definer_uid

    db_service.add_document("memories", data, doc_id=memory_id)
    db_service.delete_document("pending_memories", memory_id)
    return data


# ---------------------------------------------------------------------------
# Patient Routes
# ---------------------------------------------------------------------------

@router.get("/{memory_id}/narrate")
def narrate_memory(memory_id: str, lang: str = Query("en", description="gTTS lang code, e.g. 'en', 'hi', 'bn'"), translate_to: Optional[str] = Query(None, description="Optional language name for translation, e.g. 'Hindi'"), user=Depends(get_current_user)):
    """Returns an MP3 audio narration of a saved memory. Great for elderly patients who prefer listening."""
    memory = db_service.get_document("memories", memory_id)
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found.")
    if memory.get("user_id") != user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized to access this memory.")

    audio_stream = audio_logic.narrate_memory(memory, lang_code=lang, translate_to=translate_to)
    return StreamingResponse(audio_stream, media_type="audio/mpeg")


@router.post("/analyze")
@limiter.limit(settings.RATE_LIMIT_UPLOAD)
async def analyze_memory(request: Request, file: UploadFile = File(...), user=Depends(get_current_user)):
    """Patient uploading their own memory."""
    return await _process_memory_upload(file, target_uid=user["uid"], uploader_uid=user["uid"])


@router.post("/")
def save_memory(memory: VerifiedMemory, user=Depends(get_current_user)):
    """Patient verifying and saving their memory."""
    return _save_verified_memory(
        memory.memory_id,
        memory.model_dump(),
        target_uid=user["uid"],
        definer_uid=user["uid"]
    )


@router.get("/")
def list_memories(user=Depends(get_current_user)):
    """List patient's own memories."""
    return db_service.query_by_field("memories", "user_id", user["uid"])


# ---------------------------------------------------------------------------
# Admin Routes
# ---------------------------------------------------------------------------

@router.post("/admin/patients/{patient_uid}/upload")
@limiter.limit(settings.RATE_LIMIT_UPLOAD)
async def admin_upload_memory(request: Request, patient_uid: str, file: UploadFile = File(...), admin=Depends(get_admin_user)):
    """Admin uploading a memory on behalf of a patient."""
    result = await _process_memory_upload(file, target_uid=patient_uid, uploader_uid=admin["uid"], is_admin=True)
    result["patient_uid"] = patient_uid
    result["uploaded_by_admin"] = admin["uid"]
    return result


@router.post("/admin/patients/{patient_uid}/define")
def admin_define_memory(patient_uid: str, memory: AdminMemoryDefinition, admin=Depends(get_admin_user)):
    """Admin verifying and saving a memory on behalf of a patient."""
    return _save_verified_memory(
        memory.memory_id,
        memory.model_dump(),
        target_uid=patient_uid,
        definer_uid=admin["uid"],
        is_admin=True
    )


@router.get("/admin/patients/{patient_uid}")
def admin_list_memories(patient_uid: str, admin=Depends(get_admin_user)):
    """Admin viewing a patient's memories."""
    return db_service.query_by_field("memories", "user_id", patient_uid)


# ---------------------------------------------------------------------------
# Doctor Routes
# ---------------------------------------------------------------------------

@router.get("/doctor/patients/{patient_uid}")
def patient_memories(patient_uid: str, doctor=Depends(get_doctor_user)):
    """Doctor reviewing a patient's memories."""
    memories = db_service.query_by_field("memories", "user_id", patient_uid)
    return sorted(memories, key=lambda m: m.get("created_at", ""), reverse=True)
