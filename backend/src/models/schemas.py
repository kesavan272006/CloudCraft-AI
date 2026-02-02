from pydantic import BaseModel
from typing import List, Dict, Optional

class CompetitorRequest(BaseModel):
    query: str  # The handle (e.g., @keralafoodie) or niche

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