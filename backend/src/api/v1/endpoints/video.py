from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from src.services.videoService import VideoService
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Video Generation"])
video_service = VideoService()

class VideoRequest(BaseModel):
    prompt: str
    image_url: Optional[str] = None

@router.post("/generate")
async def create_video(request: VideoRequest):
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    try:
        # 🎯 Ensure 'await' is used for the async generate_video method
        result = await video_service.generate_video(
            user_input=request.prompt, 
            image_url=request.image_url
        )
        
        if result and "error" in result:
            logger.error(f"Video Service Error: {result['error']}")
            raise HTTPException(status_code=500, detail=result["error"])
            
        return result
    except Exception as e:
        logger.error(f"Unexpected Backend Crash: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))