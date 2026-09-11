"""
Face detection/embedding via InsightFace, used for family member enrollment
and recognition suggestions (human-in-the-loop - these are always
suggestions, never auto-applied).

SECURITY NOTES:
- Every image is decoded through Pillow first and dimension-capped before
  any face model sees it. Without this, a small file that decompresses
  into a huge bitmap (a "decompression bomb") can exhaust memory/CPU -
  this bypasses the byte-size check the routers already do, since that
  only checks the compressed size on disk.
- Pillow's own decompression-bomb guard (Image.MAX_IMAGE_PIXELS) is left
  at its default rather than disabled, as an extra layer.
- match_face uses a fixed, conservative similarity threshold - a "match"
  below this is never returned, so face_members.py can't be tricked into
  suggesting a low-confidence identity as if it were solid.
"""
import io
import numpy as np
from PIL import Image
import insightface

MAX_IMAGE_DIMENSION = 4096  # px, either side - generous for a phone photo, bounded against bombs
MATCH_SIMILARITY_THRESHOLD = 0.55  # cosine similarity floor; below this we return "no match" rather than guess

_face_app = insightface.app.FaceAnalysis(name="buffalo_l")
_face_app.prepare(ctx_id=-1, det_size=(640, 640))  # ctx_id=-1 = CPU, fine for a hackathon demo


def _safe_decode(image_bytes: bytes) -> np.ndarray:
    """Decodes via Pillow first so we can reject oversized/malformed images before the face model runs."""
    img = Image.open(io.BytesIO(image_bytes))
    img.verify()  # raises if the file is corrupt/not actually an image, catches spoofed content-types
    img = Image.open(io.BytesIO(image_bytes))  # re-open: verify() leaves the file unusable for further ops
    if img.width > MAX_IMAGE_DIMENSION or img.height > MAX_IMAGE_DIMENSION:
        raise ValueError(f"Image exceeds max dimension of {MAX_IMAGE_DIMENSION}px.")
    img = img.convert("RGB")
    return np.array(img)[:, :, ::-1]  # RGB -> BGR for insightface


def get_face_embeddings(image_bytes: bytes) -> list[dict]:
    """Returns [{'embedding': [...], 'bbox': [...], 'det_score': float}, ...]. Never raises to the caller."""
    try:
        arr = _safe_decode(image_bytes)
    except Exception as e:
        print(f"Face embedding: rejected image ({e})")
        return []

    faces = _face_app.get(arr)
    return [
        {
            "embedding": f.embedding.tolist(),
            "bbox": f.bbox.tolist(),
            "det_score": float(f.det_score),
        }
        for f in faces
    ]


def average_embedding(embeddings: list[list[float]]) -> list[float]:
    return np.mean(np.array(embeddings), axis=0).tolist()


def match_face(embedding: list[float], known_members: list[dict]) -> dict | None:
    """
    known_members: [{'member_id', 'name', 'embedding'}, ...]
    Returns the best match ONLY if it clears MATCH_SIMILARITY_THRESHOLD -
    otherwise None, so callers never have to guess whether a low-confidence
    result is safe to surface as a suggestion.
    """
    if not known_members:
        return None

    query = np.array(embedding)
    query = query / np.linalg.norm(query)

    best, best_sim = None, -1.0
    for member in known_members:
        candidate = np.array(member["embedding"])
        candidate = candidate / np.linalg.norm(candidate)
        sim = float(np.dot(query, candidate))
        if sim > best_sim:
            best, best_sim = member, sim

    if best_sim < MATCH_SIMILARITY_THRESHOLD:
        return None

    return {"member_id": best["member_id"], "name": best["name"], "similarity": round(best_sim, 3)}
