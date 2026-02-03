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

# --- BRAND BRAIN SCHEMAS ---
class BrandProfile(BaseModel):
    brandName: str
    brandDescription: str
    brandVoice: str
    targetAudience: str
    lastUpdated: Optional[str] = None

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

# --- CAMPAIGN ARCHITECT SCHEMAS ---
class AudienceSegment(BaseModel):
    segment_name: str
    pain_point: str

class CampaignStrategy(BaseModel):
    core_concept: str
    target_audience: List[AudienceSegment]
    usps: List[str]
    tone: str
    tagline: str
    visual_direction: str

class CampaignBase(BaseModel):
    name: str
    goal: str
    duration: str
    budget: str

class CampaignCreate(CampaignBase):
    pass

class Campaign(CampaignBase):
    id: str
    status: str  # draft, active, completed
    strategy: Optional[CampaignStrategy] = None
    created_at: str