"""
Face detection/embedding via InsightFace, used for family member enrollment
and recognition suggestions (human-in-the-loop - these are always
suggestions, never auto-applied).
"""
import io
import numpy as np
from PIL import Image
import insightface

MAX_IMAGE_DIMENSION = 4096  # px, either side - generous for a phone photo, bounded against bombs
MATCH_SIMILARITY_THRESHOLD = 0.55  # cosine similarity floor; below this we return "no match" rather than guess

_face_app = None


def get_face_app():
    """Lazy-load the face analysis model so server import time is instantaneous."""
    global _face_app
    if _face_app is None:
        try:
            _face_app = insightface.app.FaceAnalysis(name="buffalo_s")
            _face_app.prepare(ctx_id=-1, det_size=(640, 640))
        except Exception:
            try:
                _face_app = insightface.app.FaceAnalysis(name="buffalo_l")
                _face_app.prepare(ctx_id=-1, det_size=(640, 640))
            except Exception as e:
                print(f"InsightFace preparation warning: {e}")
                _face_app = None
    return _face_app


def _safe_decode(image_bytes: bytes) -> np.ndarray:
    """Decodes via Pillow first so we can reject oversized/malformed images before the face model runs."""
    img = Image.open(io.BytesIO(image_bytes))
    img.verify()
    img = Image.open(io.BytesIO(image_bytes))
    if img.width > MAX_IMAGE_DIMENSION or img.height > MAX_IMAGE_DIMENSION:
        raise ValueError(f"Image exceeds max dimension of {MAX_IMAGE_DIMENSION}px.")
    img = img.convert("RGB")
    return np.array(img)[:, :, ::-1]


def get_face_embeddings(image_bytes: bytes) -> list[dict]:
    """Returns [{'embedding': [...], 'bbox': [...], 'det_score': float}, ...]. Never raises to the caller."""
    try:
        arr = _safe_decode(image_bytes)
    except Exception as e:
        print(f"Face embedding: rejected image ({e})")
        return []

    app = get_face_app()
    if not app:
        return []

    try:
        faces = app.get(arr)
        return [
            {
                "embedding": f.embedding.tolist(),
                "bbox": f.bbox.tolist(),
                "det_score": float(f.det_score),
            }
            for f in faces
        ]
    except Exception as e:
        print(f"Face detection error: {e}")
        return []


def average_embedding(embeddings: list[list[float]]) -> list[float]:
    """Given multiple face embeddings of the same person, compute the normalized average."""
    if not embeddings:
        return []
    arr = np.array(embeddings)
    mean_vec = np.mean(arr, axis=0)
    norm = np.linalg.norm(mean_vec)
    if norm > 0:
        mean_vec = mean_vec / norm
    return mean_vec.tolist()


def match_face(target_embedding: list[float], known_members: list[dict]) -> dict | None:
    """Cosine similarity matching between a detected face and known family members."""
    if not known_members or not target_embedding:
        return None

    target = np.array(target_embedding)
    target_norm = np.linalg.norm(target)
    if target_norm == 0:
        return None
    target = target / target_norm

    best_match = None
    best_sim = -1.0

    for m in known_members:
        emb = m.get("embedding")
        if not emb:
            continue
        known = np.array(emb)
        known_norm = np.linalg.norm(known)
        if known_norm == 0:
            continue
        known = known / known_norm

        sim = float(np.dot(target, known))
        if sim > best_sim and sim >= MATCH_SIMILARITY_THRESHOLD:
            best_sim = sim
            best_match = {
                "name": m.get("name"),
                "member_id": m.get("member_id") or m.get("_id"),
                "similarity": round(sim, 3),
            }

    return best_match
