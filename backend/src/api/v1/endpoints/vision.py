from fastapi import APIRouter
from pydantic import BaseModel
from src.services.media_services import MediaService

router = APIRouter()

class ImageRequest(BaseModel):
    prompt: str

@router.post("/generate-image")
async def create_image(request: ImageRequest):
    result = await MediaService.generate_enhanced_image(request.prompt)
    return result