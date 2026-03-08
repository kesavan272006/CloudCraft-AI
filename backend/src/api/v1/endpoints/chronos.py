from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from src.services.chronos_service import ChronosService
from src.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()

class MissionRequest(BaseModel):
    goal: str
    duration_days: int = 90
    budget_tier: str = "growth"
    automation_level: str = "suggest"

@router.post("/mission")
async def create_mission(request: MissionRequest):
    try:
        mission = await ChronosService.create_mission(
            goal=request.goal,
            duration_days=request.duration_days,
            budget_tier=request.budget_tier,
            automation_level=request.automation_level
        )
        return mission
    except Exception as e:
        logger.exception(f"Chronos Mission Creation Failed: {request.goal}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/missions")
async def list_missions():
    return await ChronosService.get_missions()

@router.get("/mission/{mission_id}")
async def get_mission(mission_id: str):
    mission = await ChronosService.get_mission(mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    return mission

@router.post("/mission/{mission_id}/pivot")
async def authorize_pivot(mission_id: str, pivot_context: str):
    try:
        return await ChronosService.authorize_pivot(mission_id, pivot_context)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception(f"Chronos Pivot Failed: {mission_id}")
        raise HTTPException(status_code=500, detail=str(e))
