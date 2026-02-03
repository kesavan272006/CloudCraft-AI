from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.services.scout_service import LocalScoutService
from src.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

# Schema for the incoming request
class ScoutRequest(BaseModel):
    city: str
    lat: float
    lng: float

@router.post("/scout")
async def scout_location(request: ScoutRequest):
    """
    Endpoint that triggers the Agentic Scout to find localized trends
    using NVIDIA Nemotron and Tavily.
    """
    logger.info(f"Agent Scout deployed for location: {request.city} ({request.lat}, {request.lng})")
    
    try:
        # Call the reasoning service
        insights = await LocalScoutService.get_localized_insights(
            city=request.city, 
            lat=request.lat, 
            lng=request.lng
        )
        
        return {
            "insights": insights, 
            "status": "success",
            "metadata": {
                "location": request.city,
                "agent": "NVIDIA-Nemotron-70B"
            }
        }
    except Exception as e:
        logger.error(f"Scout Agent Error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Agent failed to retrieve local intel: {str(e)}"
        )