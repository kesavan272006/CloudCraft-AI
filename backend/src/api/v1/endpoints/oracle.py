from fastapi import APIRouter, HTTPException
from src.models.schemas import OracleRequest, OracleResponse, MetricScore, TimePoint
from src.core.llm_factory import LLMFactory
from src.services.brand_service import BrandService
import json
import re

router = APIRouter()

@router.post("/predict", response_model=OracleResponse)
async def predict_performance(request: OracleRequest):
    from fastapi.concurrency import run_in_threadpool
    from src.services.oracle_service import OracleService

    try:
        # Run blocking service method in threadpool
        response = await run_in_threadpool(OracleService.predict_performance, request.content)
        return response

    except Exception as e:
        print(f"Oracle Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_oracle_history():
    from fastapi.concurrency import run_in_threadpool
    from src.services.oracle_service import OracleService
    
    try:
        history = await run_in_threadpool(OracleService.get_history)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))