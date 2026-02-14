from fastapi import APIRouter, HTTPException
from src.models.schemas import MissionExecutionRequest, MissionExecutionResponse, ScheduledPost
from src.services.calendar_service import CalendarService
from src.services.aws_service import EventBridgeService
from src.agents.dispatcher_agent import DispatcherAgent
from src.utils.logger import get_logger
from datetime import datetime
import uuid

logger = get_logger(__name__)
router = APIRouter()
aws_service = EventBridgeService()
dispatcher = DispatcherAgent()

@router.post("/execute", response_model=MissionExecutionResponse)
async def execute_mission(request: MissionExecutionRequest):
    """
    Schedules an autonomous mission via AWS EventBridge.
    """
    try:
        # 1. Parse trigger time
        try:
            target_time = datetime.fromisoformat(request.scheduled_at)
        except ValueError:
            target_time = datetime.now() # Fallback
            
        # 2. Register in Local Calendar (Simulated Database)
        post_id = str(uuid.uuid4())
        CalendarService.schedule_post({
            "id": post_id,
            "content": request.content,
            "platform": request.platform,
            "scheduled_time": request.scheduled_at,
            "status": "scheduled",
            "persona_name": request.persona_name,
            "webhook_url": request.webhook_url
        })
        
        # 3. Create AWS EventBridge Schedule
        payload = {
            "post_id": post_id,
            "platform": request.platform,
            "webhook_url": request.webhook_url
        }
        
        mission_arn = await aws_service.create_schedule(
            name=request.platform.replace(" ", "_"),
            scheduled_time=target_time,
            target_url=request.webhook_url,
            payload=payload
        )
        
        # 4. Update local record with ARN
        # (In a real app, we'd find the post and update it)
        
        return MissionExecutionResponse(
            post_id=post_id,
            aws_mission_id=mission_arn,
            status="active",
            message=f"Mission dispatched to AWS EventBridge. Triggers at {request.scheduled_at}"
        )
        
    except Exception as e:
        logger.error(f"Nexus Execution Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-dispatch/{post_id}")
async def test_dispatch(post_id: str):
    """
    Manual trigger to simulate EventBridge callback for the demo.
    """
    # This would normally be called by EventBridge Target
    posts = CalendarService.get_all_posts()
    post = next((p for p in posts if p.id == post_id), None)
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # 1. Start Audit
    post.status = "auditing"
    
    # 2. Run Dispatcher
    success = await dispatcher.dispatch(
        content=post.content,
        platform=post.platform,
        webhook_url=post.webhook_url or "https://hook.us1.make.com/your-default-hook"
    )
    
    if success:
        post.status = "dispatched"
        return {"status": "success", "message": "Content audited and dispatched to webhook."}
    else:
        post.status = "failed"
        return {"status": "error", "message": "Dispatch failed."}
