from fastapi import APIRouter
from src.services.calendar_service import CalendarService
from src.services.oracle_service import OracleService
import statistics
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats():
    """
    Aggregates high-level metrics for the CloudCraft AI Mission Control.
    """
    # 1. Fetch data from services
    posts = CalendarService.get_all_posts()
    oracle_history = OracleService.get_history()
    
    # 2. Calculate Mission Status
    active_missions = len([p for p in posts if p.status == "scheduled"])
    completed_missions = len([p for p in posts if p.status == "dispatched"])
    
    # 3. Calculate Oracle Performance (Weighted between history and scheduled)
    history_scores = [item.response.viral_score for item in oracle_history if hasattr(item.response, 'viral_score')]
    # Handle both object and dict if necessary (based on OracleHistoryItem definition)
    if not history_scores:
        history_scores = [item.response['viral_score'] for item in oracle_history if 'viral_score' in item.response]

    scheduled_scores = [p.performance_score for p in posts if p.performance_score]
    
    all_scores = history_scores + scheduled_scores
    avg_score = round(statistics.mean(all_scores), 1) if all_scores else 82.0
    
    # 4. Cultural Coverage (Dynamic inference for demo)
    # We look at the content of scheduled posts to find Hindi characters or "Hinglish" patterns
    lang_counts = {"English": 0, "Hinglish": 0, "Hindi": 0, "Regional": 0}
    
    for p in posts:
        content = p.content.lower()
        if any(c >= '\u0900' and c <= '\u097f' for c in p.content):
            lang_counts["Hindi"] += 1
        elif any(word in content for word in ["yaar", "kya", "hai", "accha", "namaste", "chalo"]):
            lang_counts["Hinglish"] += 1
        else:
            lang_counts["English"] += 1
            
    # Add base distribution if counts are low
    if len(posts) < 5:
        lang_counts["English"] += 12
        lang_counts["Hinglish"] += 8
        lang_counts["Hindi"] += 5
        lang_counts["Regional"] += 3

    cultural_coverage = [{"name": k, "value": v} for k, v in lang_counts.items() if v > 0]
    
    # 5. Recent Activity Feed
    recent_activity = []
    # Sort posts by time descending for feed
    sorted_posts = sorted(posts, key=lambda x: x.scheduled_time, reverse=True)
    for p in sorted_posts[:5]:
        recent_activity.append({
            "id": p.id,
            "type": "mission",
            "content": p.content[:60] + "...",
            "platform": p.platform,
            "status": p.status,
            "time": p.scheduled_time
        })

    return {
        "metrics": {
            "active_missions": active_missions,
            "completed_missions": completed_missions,
            "avg_oracle_score": avg_score,
            "total_assets": len(posts) + len(oracle_history)
        },
        "cultural_coverage": cultural_coverage,
        "recent_activity": recent_activity,
        "efficiency_gain": f"{min(200 + (len(posts) * 45), 850)}%" 
    }

@router.get("/analytics")
async def get_analytics():
    """
    Provides time-series data for the analytics tab.
    """
    # Create weekly trending data
    now = datetime.now()
    trending = []
    for i in range(7):
        day = now - timedelta(days=(6-i))
        trending.append({
            "name": day.strftime("%a"),
            "score": 65 + (i * 4) + (i % 2 * 5), # Simulated growth
            "vol": 2 + i + (i % 3)
        })
        
    return {
        "trending": trending,
        "platform_performance": [
            {"name": "LinkedIn", "score": 88, "engagement": 1200},
            {"name": "Twitter", "score": 72, "engagement": 800},
            {"name": "Instagram", "score": 85, "engagement": 2500},
            {"name": "Facebook", "score": 68, "engagement": 450}
        ]
    }
