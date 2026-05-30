import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

ALLOWED_VIDEO_TYPES = ["video/mp4", "video/mov", "video/avi", "video/webm"]
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]


async def upload_video(file: UploadFile, folder: str = "videos") -> dict:
    """Upload a video file to Cloudinary. Returns url, public_id, duration."""
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(status_code=400, detail="Invalid video format. Use MP4, MOV, AVI or WEBM.")
    contents = await file.read()
    result = cloudinary.uploader.upload(
        contents,
        resource_type="video",
        folder=folder,
        chunk_size=6000000
    )
    return {
        "url":       result["secure_url"],
        "public_id": result["public_id"],
        "duration":  int(result.get("duration", 0))
    }


async def upload_image(file: UploadFile, folder: str = "images") -> str:
    """Upload an image to Cloudinary. Returns the secure URL."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid image format. Use JPEG, PNG or WEBP.")
    contents = await file.read()
    result = cloudinary.uploader.upload(
        contents,
        resource_type="image",
        folder=folder,
        transformation=[{"width": 800, "crop": "scale"}]
    )
    return result["secure_url"]


async def delete_file(public_id: str, resource_type: str = "video"):
    """Delete a file from Cloudinary by its public_id."""
    cloudinary.uploader.destroy(public_id, resource_type=resource_type)