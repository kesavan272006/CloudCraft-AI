from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from src.services.vernacular_service import VernacularService
from src.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

class VernacularRequest(BaseModel):
    content: str
    state: str

class VernacularResponse(BaseModel):
    original_content: str
    translated_content: str
    state: str
    language: str
    cultural_nuances: List[str]
    local_slang: List[str]
    visual_cues: str
    tone: str

@router.post("/transmute", response_model=VernacularResponse)
async def transmute_vernacular(request: VernacularRequest):
    """
    Culturally and linguistically adapt content for a specific Indian state.
    """
    try:
        service = VernacularService()
        result = await service.transmute_content(request.content, request.state)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return result
    except Exception as e:
        logger.error(f"Endpoint error in vernacular transmute: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
