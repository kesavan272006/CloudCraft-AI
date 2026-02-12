import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from src.models.schemas import ScheduledPost

class CalendarService:
    # In-memory storage for hackathon demonstration
    _scheduled_posts: List[ScheduledPost] = []

    @classmethod
    def get_all_posts(cls) -> List[ScheduledPost]:
        """Return all scheduled posts, sorted by time."""
        # Add some mock data if empty for demo purposes
        if not cls._scheduled_posts:
            cls._seed_mock_data()
        
        return sorted(cls._scheduled_posts, key=lambda x: x.scheduled_time)

    @classmethod
    def schedule_post(cls, post_data: dict) -> ScheduledPost:
        """Create and save a new scheduled post."""
        post = ScheduledPost(
            id=str(uuid.uuid4()),
            content=post_data.get("content", ""),
            platform=post_data.get("platform", "LinkedIn"),
            scheduled_time=post_data.get("scheduled_time", datetime.now().isoformat()),
            status=post_data.get("status", "scheduled"),
            performance_score=post_data.get("performance_score"),
            persona_name=post_data.get("persona_name")
        )
        cls._scheduled_posts.append(post)
        return post

    @classmethod
    def delete_post(cls, post_id: str) -> bool:
        """Remove a post from the calendar."""
        initial_count = len(cls._scheduled_posts)
        cls._scheduled_posts = [p for p in cls._scheduled_posts if p.id != post_id]
        return len(cls._scheduled_posts) < initial_count

    @classmethod
    def _seed_mock_data(cls):
        """Seed some initial posts for a better first impression."""
        now = datetime.now()
        
        mock_posts = [
            {
                "content": "Excited to announce our new AI-powered Content Engine! #AI #Innovation",
                "platform": "LinkedIn Professional",
                "scheduled_time": (now + timedelta(days=1)).replace(hour=9, minute=0).isoformat(),
                "performance_score": 88,
                "persona_name": "Working Professional"
            },
            {
                "content": "AI is changing how we create. Are you ready for the future? 🚀",
                "platform": "Twitter Thread",
                "scheduled_time": (now + timedelta(days=2)).replace(hour=14, minute=30).isoformat(),
                "performance_score": 75,
                "persona_name": "Gen-Z"
            },
            {
                "content": "Detailed guide on implementing agentic workflows into your business.",
                "platform": "LinkedIn Article",
                "scheduled_time": (now + timedelta(days=4)).replace(hour=10, minute=0).isoformat(),
                "performance_score": 92,
                "persona_name": "Entrepreneur"
            }
        ]
        
        for data in mock_posts:
            cls.schedule_post(data)
