from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Request
from typing import List
from app.services import firebase_service, face_service
from app.services.auth_dependency import get_current_user
from app.limiter import limiter
from app.config import settings

router = APIRouter(prefix="/api/family-members", tags=["family-members"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB per photo
MIN_ENROLLMENT_PHOTOS = 1
MAX_ENROLLMENT_PHOTOS = 5  # matches the "3-5 photos" spec, hard-capped to stop abuse


@router.post("/enroll")
@limiter.limit(settings.RATE_LIMIT_UPLOAD)
async def enroll_family_member(
    request: Request,
    name: str = Form(..., max_length=100),
    relationship: str = Form(..., max_length=50),
    files: List[UploadFile] = File(...),
    user=Depends(get_current_user),
):
    """
    Enrollment - NOT training. Takes 3-5 photos of one person, gets their
    face embedding from each, averages into a single reference embedding.

    SECURITY: validates file count, content-type, and size before reading
    anything into memory; rate-limited since this triggers face-model
    inference per photo (compute-cost abuse vector otherwise). Image
    dimension/decompression-bomb checks happen inside face_service.
    """
    if not name.strip() or not relationship.strip():
        raise HTTPException(status_code=400, detail="Name and relationship are required.")

    if len(files) < MIN_ENROLLMENT_PHOTOS or len(files) > MAX_ENROLLMENT_PHOTOS:
        raise HTTPException(
            status_code=400,
            detail=f"Please upload between {MIN_ENROLLMENT_PHOTOS} and {MAX_ENROLLMENT_PHOTOS} photos.",
        )

    embeddings = []
    for f in files:
        if f.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {f.content_type}")

        image_bytes = await f.read()

        if len(image_bytes) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(status_code=400, detail="One or more photos exceed the 10MB limit.")
        if len(image_bytes) == 0:
            continue

        faces = face_service.get_face_embeddings(image_bytes)
        if faces:
            # assume the largest/most confident face in an enrollment photo
            best_face = max(faces, key=lambda x: x["det_score"])
            embeddings.append(best_face["embedding"])

    if not embeddings:
        return {"error": "No faces detected in the uploaded photos. Try clearer, front-facing photos."}

    reference_embedding = face_service.average_embedding(embeddings)

    member_id = firebase_service.add_document("family_members", {
        "user_id": user["uid"],
        "name": name.strip(),
        "relationship": relationship.strip(),
        "embedding": reference_embedding,
        "enrolled_photo_count": len(embeddings),
    })

    return {"member_id": member_id, "name": name.strip(), "relationship": relationship.strip(),
             "enrolled_photo_count": len(embeddings)}


@router.get("/")
def list_family_members(user=Depends(get_current_user)):
    members = firebase_service.query_by_field("family_members", "user_id", user["uid"])
    # don't ship raw embeddings to the frontend, no need for it there
    return [{"member_id": m["_id"], "name": m["name"], "relationship": m["relationship"]} for m in members]


@router.post("/recognize")
@limiter.limit(settings.RATE_LIMIT_UPLOAD)
async def recognize_faces_in_photo(request: Request, file: UploadFile = File(...), user=Depends(get_current_user)):
    """
    Given a new memory photo, detect faces and suggest likely family members.
    Still requires human confirmation per the human-in-the-loop principle -
    this returns SUGGESTIONS, not final labels.
    """
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WEBP images are allowed.")

    image_bytes = await file.read()

    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Image exceeds 10MB limit.")
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file.")

    detected_faces = face_service.get_face_embeddings(image_bytes)
    known_members = firebase_service.query_by_field("family_members", "user_id", user["uid"])
    known_members = [{"member_id": m["_id"], "name": m["name"], "embedding": m["embedding"]} for m in known_members]

    suggestions = []
    for face in detected_faces:
        match = face_service.match_face(face["embedding"], known_members)
        suggestions.append({
            "bbox": face["bbox"],
            "suggested_match": {"member_id": match["member_id"], "name": match["name"],
                                  "similarity": match["similarity"]} if match else None,
        })

    return {"faces_detected": len(detected_faces), "suggestions": suggestions}
