from fastapi import APIRouter, HTTPException
from src.services.performance_service import PerformanceService
from src.models.schemas import PerformanceRequest, PerformanceResponse

router = APIRouter()
performance_service = PerformanceService()

@router.post("/predict", response_model=PerformanceResponse)
async def predict_performance(request: PerformanceRequest):
    """
    Analyze content and predict performance metrics.
    """
    try:
        result = performance_service.analyze_content(
            content=request.content,
            platform=request.platform,
            persona=request.persona
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
