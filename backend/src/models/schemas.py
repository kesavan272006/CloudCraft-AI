from pydantic import BaseModel
from typing import List, Dict, Optional

# --- FORGE SCHEMAS ---
class AgentThought(BaseModel):
    agent: str
    thought: str
    output: str

class ForgeResponse(BaseModel):
    final_content: str
    thoughts: List[AgentThought]
    status: str

# --- COMPETITOR PULSE SCHEMAS ---
class CompetitorRequest(BaseModel):
    query: str  # The handle or niche

class CompetitorSuggestion(BaseModel):
    caption: str
    hashtags: List[str]
    visual_idea: str
    best_time_to_post: str
    why_it_works: str
    compliance_note: str

class CompetitorPulseResponse(BaseModel):
    competitor_handle: str
    summary: str
    suggestions: CompetitorSuggestion
    status: str = "success"

# --- PERFORMANCE ORACLE SCHEMAS (NEW) ---
class OracleRequest(BaseModel):
    content: str  # The draft post to analyze

class MetricScore(BaseModel):
    subject: str  # e.g., "Hook", "Trend", "Clarity"
    score: int    # 0-100 for Radar Chart
    fullMark: int = 100

class TimePoint(BaseModel):
    time: str     # e.g., "1h", "2h", "6h"
    engagement: int # Predicted value for Area Chart

class OracleResponse(BaseModel):
    viral_score: int
    confidence_level: str
    radar_data: List[MetricScore]
    forecast_data: List[TimePoint]
    analysis_report: str
    status: str = "success"