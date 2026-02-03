
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, Optional

from src.services.genesis_service import GenesisService

router = APIRouter(tags=["genesis"])

class StartGenesisRequest(BaseModel):
    input_source: str

class TrendJackRequest(BaseModel):
    process_id: str
    trend: str

class TuneRequest(BaseModel):
    process_id: str
    dialect: str

@router.post("/start")
async def start_genesis(request: StartGenesisRequest):
    """
    Triggers the recursive campaign generation.
    Returns process_id immediately.
    """
    try:
        result = await GenesisService.start_genesis(request.input_source)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{process_id}")
async def get_genesis_status(process_id: str):
    """
    Polls the current state of the graph.
    """
    graph = GenesisService.get_graph(process_id)
    if not graph:
        raise HTTPException(status_code=404, detail="Process not found")
    return graph

@router.post("/trend-jack")
async def trend_jack(request: TrendJackRequest):
    """
    Rewrites the campaign based on a trend.
    """
    try:
        # We run this in background typically, but for simple MVP logic in Service,
        # we can await it or background it. Service method is async.
        # For immediate feedback feeling, we return acknowledgement.
        
        # Note: Using BackgroundTasks here would be better, but the Service
        # method already awaits tasks. We'll simply call it.
        result = await GenesisService.trend_jack(request.process_id, request.trend)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tune")
async def tune_campaign(request: TuneRequest):
    """
    Rewrites content to a specific dialect.
    """
    try:
        result = await GenesisService.tune_campaign(request.process_id, request.dialect)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
