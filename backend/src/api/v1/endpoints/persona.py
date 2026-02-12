from fastapi import APIRouter, HTTPException
from src.models.schemas import PersonaRequest, PersonaResponse, PersonaInfo
from src.services.persona_service import persona_service
from typing import List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/persona", tags=["persona"])

@router.get("/list", response_model=List[PersonaInfo])
async def list_personas():
    """
    Get list of all available audience personas
    """
    try:
        personas = persona_service.get_available_personas()
        return personas
    except Exception as e:
        logger.error(f"Error listing personas: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate", response_model=PersonaResponse)
async def generate_persona_variants(request: PersonaRequest):
    """
    Generate content variants for multiple audience personas
    
    Takes original content and generates personalized versions for each selected persona.
    """
    try:
        if not request.content:
            raise HTTPException(status_code=400, detail="Content cannot be empty")
        
        if not request.personas or len(request.personas) == 0:
            raise HTTPException(status_code=400, detail="At least one persona must be selected")
        
        logger.info(f"Generating variants for {len(request.personas)} personas")
        
        response = await persona_service.generate_persona_variants(
            original_content=request.content,
            persona_ids=request.personas
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating persona variants: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
