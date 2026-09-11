from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.services import firebase_service, vision_service, face_service, cloudinary_service
from app.services.auth_dependency import get_current_user
from app.limiter import limiter
from app.config import settings
import uuid

router = APIRouter(prefix="/api/memories", tags=["memories"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB - generous for a phone photo, bounded for cost/DoS


@router.post("/analyze")
@limiter.limit(settings.RATE_LIMIT_UPLOAD)
async def analyze_memory(
    request: Request,
    file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    """
    Step 3-5: upload photo -> Cloudinary -> vision model (scene/activity) +
    InsightFace (who's in it) run in parallel -> combined hypothesis.

    Face matches are SUGGESTIONS ("this looks 82% like Dad") - the family
    still confirms/corrects each one before anything is saved. This endpoint
    never writes people[] to the memory itself, it only proposes them.

    SECURITY: validates content-type and size before doing anything with the
    upload; rate-limited since this triggers a vision-model call + Cloudinary
    upload + face detection per request (cost/compute abuse vector).
    """
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WEBP images are allowed.")

    image_bytes = await file.read()

    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Image exceeds 10MB limit.")
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file.")

    memory_id = str(uuid.uuid4())
    content_type = file.content_type

    photo_url = cloudinary_service.upload_photo(
        image_bytes, f"users/{user['uid']}/memories/{memory_id}"
    )

    # Scene/activity/objects/location hypothesis (local Ollama/llava, cloud fallback optional)
    hypothesis = vision_service.analyze_photo(image_bytes, content_type)

    # Face detection + matching against this user's enrolled family members (InsightFace)
    detected_faces = face_service.get_face_embeddings(image_bytes)
    known_members = firebase_service.query_by_field("family_members", "user_id", user["uid"])
    known_members = [{"member_id": m["_id"], "name": m["name"], "embedding": m["embedding"]} for m in known_members]

    face_suggestions = []
    for face in detected_faces:
        match = face_service.match_face(face["embedding"], known_members)
        face_suggestions.append({
            "bbox": face["bbox"],
            "suggested_name": match["name"] if match else None,
            "member_id": match["member_id"] if match else None,
            "similarity": match["similarity"] if match else None,
        })

    # people_count from vision model vs faces_detected from InsightFace can disagree
    # (e.g. someone facing away) - surface both, let the family reconcile it.
    hypothesis["faces_detected"] = len(detected_faces)

    # Record that this memory_id/photo_url pair was legitimately produced by
    # THIS user's analyze call, so save_memory can verify against it below
    # instead of trusting whatever the client claims at save time.
    firebase_service.add_document(
        "pending_memories",
        {"user_id": user["uid"], "photo_url": photo_url, "created_at": datetime.utcnow().isoformat()},
        doc_id=memory_id,
    )

    return {
        "memory_id": memory_id,
        "photo_url": photo_url,
        "hypothesis": hypothesis,
        "face_suggestions": face_suggestions,
    }


class VerifiedMemory(BaseModel):
    memory_id: str
    photo_url: str
    people: List[str] = Field(default_factory=list, max_length=20)
    location: Optional[str] = Field(default=None, max_length=200)
    activity: Optional[str] = Field(default=None, max_length=200)
    event: Optional[str] = Field(default=None, max_length=200)
    story: Optional[str] = Field(default=None, max_length=2000)
    scene: Optional[str] = Field(default=None, max_length=200)
    objects: List[str] = Field(default_factory=list, max_length=30)
    occurred_at: Optional[str] = None  # when the memory itself happened, if the family knows/enters it


@router.post("/")
def save_memory(memory: VerifiedMemory, user=Depends(get_current_user)):
    """
    Step 6-7: called after family confirms/corrects the hypothesis.

    SECURITY: memory_id is client-supplied and used as the Firestore doc ID.
    Without an ownership trail, any authenticated user could submit an
    existing memory_id belonging to someone else and silently overwrite
    their saved memory (IDOR / broken access control). Fixed by:
      1. Requiring the memory_id to trace back to a "pending_memories" record
         created by THIS user during /analyze (proves they actually uploaded
         and analyzed this photo first).
      2. Rejecting the save outright if a memories/{memory_id} doc already
         exists under a different user_id.
      3. Ignoring any client-supplied photo_url and using the one recorded
         server-side at analyze time, so a client can't claim someone else's
         Cloudinary URL as their own memory's photo.

    created_at is set here (server-side, upload time) so that memories are
    always orderable even if occurred_at is never filled in - this is what
    the sequence quiz activity (quiz.py: /generate-sequence) sorts on.
    """
    pending = firebase_service.get_document("pending_memories", memory.memory_id)
    if not pending or pending.get("user_id") != user["uid"]:
        raise HTTPException(
            status_code=403,
            detail="This memory_id was not produced by your own /analyze call.",
        )

    existing = firebase_service.get_document("memories", memory.memory_id)
    if existing and existing.get("user_id") != user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized to modify this memory.")

    data = {
        **memory.model_dump(),
        "photo_url": pending["photo_url"],  # server-trusted, not client-trusted
        "user_id": user["uid"],
        "verified": True,
        "created_at": datetime.utcnow().isoformat(),
    }
    firebase_service.add_document("memories", data, doc_id=memory.memory_id)
    firebase_service.delete_document("pending_memories", memory.memory_id)  # one-time use, prevents replay/reuse
    return data


@router.get("/")
def list_memories(user=Depends(get_current_user)):
    return firebase_service.query_by_field("memories", "user_id", user["uid"])
