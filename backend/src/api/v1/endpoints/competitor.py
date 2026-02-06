from fastapi import APIRouter, HTTPException
from src.models.schemas import CompetitorRequest, CompetitorPulseResponse
from src.services.competitor_service import CompetitorService
from src.utils.logger import get_logger
import json

logger = get_logger(__name__)

router = APIRouter()

@router.post("/pulse", response_model=CompetitorPulseResponse)
async def get_competitor_pulse(request: CompetitorRequest):
    """
    Endpoint for 'Competitor Pulse'.
    Performs deep research on a niche/competitor and returns a strategic counter-play.
    """
    try:
        # 1. Get structured analysis (JSON string) from Service
        raw_json_str = await CompetitorService.analyze_competitor(request.query)
        
        # 2. Parse the JSON
        analysis_data = json.loads(raw_json_str)
        
        # 3. Construct and return the response
        # The keys in analysis_data must match our CompetitorPulseResponse schema
        return CompetitorPulseResponse(
            competitor_handle=request.query,
            threat_level=analysis_data.get("threat_level", 50),
            competitor_status=analysis_data.get("competitor_status", "Neutral"),
            intelligence_brief=analysis_data.get("intelligence_brief", "Strategic audit completed."),
            winning_patterns=analysis_data.get("winning_patterns", {}),
            swot=analysis_data.get("swot", {}),
            counter_play=analysis_data.get("strategic_counter_play", {}),
            suggested_assets=analysis_data.get("suggested_assets", []),
            status="success"
        )
        
    except json.JSONDecodeError as je:
        logger.error(f"Failed to parse Agent JSON: {je}")
        raise HTTPException(status_code=500, detail="Intelligence report formatting error. Please try again.")
    except Exception as e:
        logger.error(f"Competitor Pulse API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))