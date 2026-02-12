from fastapi import APIRouter, HTTPException
from typing import List
from src.services.calendar_service import CalendarService
from src.models.schemas import ScheduledPost, CalendarResponse

router = APIRouter()

@router.get("/", response_model=CalendarResponse)
async def get_calendar_posts():
    """Get all scheduled posts."""
    try:
        posts = CalendarService.get_all_posts()
        return CalendarResponse(posts=posts)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/schedule", response_model=ScheduledPost)
async def schedule_post(post: dict):
    """Schedule a new post."""
    try:
        new_post = CalendarService.schedule_post(post)
        return new_post
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{post_id}")
async def delete_post(post_id: str):
    """Delete a post from the calendar."""
    if CalendarService.delete_post(post_id):
        return {"status": "success", "message": "Post deleted"}
    raise HTTPException(status_code=404, detail="Post not found")
