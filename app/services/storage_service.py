"""
Photo storage via Cloudinary instead of Firebase Storage - Firebase Storage
now requires the paid Blaze plan even for free-tier usage, Cloudinary's free
tier (25GB, no card required) covers this fine for a hackathon prototype.

Firestore + Firebase Auth are unaffected - only WHERE photos physically live
changed. Everything else (routes, memory records) still just stores/reads a
photo_url string, so this swap doesn't ripple anywhere else in the app.

SECURITY: dest_path is always built server-side from user['uid'] (from a
verified token) and a server-generated memory_id (uuid4) - never from raw
client input - so there's no path-traversal or overwrite-another-user's-photo
risk here.
"""
import cloudinary
import cloudinary.uploader
from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


def upload_photo(image_bytes: bytes, dest_path: str) -> str:
    """
    dest_path example: users/{user_id}/memories/{memory_id}
    (Cloudinary manages its own extensions/versioning, so no .jpg needed here)
    Returns a public HTTPS URL to the uploaded image.
    """
    result = cloudinary.uploader.upload(
        image_bytes,
        public_id=dest_path,
        folder=None,  # dest_path already encodes the folder structure via slashes
        resource_type="image",
        overwrite=True,
    )
    return result["secure_url"]
