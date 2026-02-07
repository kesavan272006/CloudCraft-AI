from pydantic import BaseModel
from typing import List, Dict, Optional, Any

# --- FORGE SCHEMAS ---
class AgentThought(BaseModel):
    agent: str
    thought: str
    output: str

class ForgeResponse(BaseModel):
    final_content: str
    thoughts: List[AgentThought]
    status: str

# --- TRANSMUTE SCHEMAS ---
class TransmuteRequest(BaseModel):
    content: str
    target_format: str # e.g., "Twitter Thread", "Instagram Reel Script", "LinkedIn Post"
    target_language: str = "English" # e.g., "Hindi", "Tamil", "Hinglish"
    tone_modifier: Optional[str] = None

class TransmuteResponse(BaseModel):
    transformed_content: str
    format_notes: str
    regional_nuance: str
    suggested_tags: List[str]
    estimated_reading_time: str
    status: str = "success"

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

class WinningPatterns(BaseModel):
    hooks: List[str]
    visual_secret: str
    psychology: str

class SWOTAnalysis(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    opportunities: List[str]
    threats: List[str]

class CounterPlay(BaseModel):
    the_pivot: str
    content_series_concept: Any # Can be str or dict
    execution_difficulty: str

class SuggestedAsset(BaseModel):
    type: str # Reel, Post, Thread
    headline: str
    script_outline: Any # Can be str or list of steps
    visual_vibe: str
    impact_prediction: str

class CompetitorPulseResponse(BaseModel):
    competitor_handle: str
    threat_level: int
    competitor_status: str
    intelligence_brief: str
    winning_patterns: WinningPatterns
    swot: SWOTAnalysis
    counter_play: CounterPlay
    suggested_assets: List[SuggestedAsset]
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

class OracleHistoryItem(BaseModel):
    id: str
    timestamp: str
    input_content: str
    response: OracleResponse

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