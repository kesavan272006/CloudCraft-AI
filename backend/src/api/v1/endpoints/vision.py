from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any # Added for VisionEnhancementRequest definition
from src.services.media_services import MediaService
from src.models.schemas import VisionAnalysisRequest, VisionAnalysisResponse # Removed VisionEnhancementRequest from import

router = APIRouter()

# Redefining VisionEnhancementRequest here as per user's instruction snippet
class VisionEnhancementRequest(BaseModel):
    image_base64: str
    audit_results: Dict[str, Any]
    user_prompt: Optional[str] = ""

class ImageRequest(BaseModel):
    prompt: str

@router.post("/generate-image")
async def create_image(request: ImageRequest):
    result = await MediaService.generate_enhanced_image(request.prompt)
    return result

@router.post("/analyze", response_model=VisionAnalysisResponse)
async def analyze_image(request: VisionAnalysisRequest):
    """
    Analyzes an uploaded image for vibe, context, and aesthetics.
    """
    try:
        # If image_base64 has preamble like "data:image/jpeg;base64,", strip it
        clean_base64 = request.image_base64
        if "," in clean_base64:
            clean_base64 = clean_base64.split(",")[1]
            
        result = await MediaService.analyze_image(clean_base64)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/enhance")
async def enhance_image(request: VisionEnhancementRequest):
    """
    Generates an 'Enhanced' master version of the image based on audit results.
    """
    try:
        clean_base64 = request.image_base64
        if "," in clean_base64:
            clean_base64 = clean_base64.split(",")[1]
            
        result = await MediaService.enhance_image(clean_base64, request.audit_results, request.user_prompt)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))