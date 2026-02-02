from fastapi import APIRouter, HTTPException
from src.models.schemas import CompetitorRequest, CompetitorPulseResponse, CompetitorSuggestion
from src.services.competitor_service import CompetitorService
import re

router = APIRouter()

def parse_llm_response(text: str) -> dict:
    """Helper to extract structured data from the LLM's text output"""
    data = {}
    patterns = {
        "summary": r"SUMMARY:\s*(.*)",
        "caption": r"SUGGESTED CAPTION:\s*(.*)",
        "hashtags": r"HASHTAGS:\s*\[(.*?)\]",
        "visual_idea": r"VISUAL IDEA:\s*(.*)",
        "best_time": r"BEST TIME:\s*(.*)",
        "why_it_works": r"WHY IT WORKS:\s*(.*)",
        "compliance": r"COMPLIANCE:\s*(.*)",
    }
    
    for key, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if match:
            val = match.group(1).strip()
            if key == "hashtags":
                data[key] = [tag.strip().replace("#", "") for tag in val.split(",")]
            else:
                data[key] = val
        else:
            data[key] = "Not provided" if key != "hashtags" else []
            
    return data

@router.post("/pulse", response_model=CompetitorPulseResponse)
async def get_competitor_pulse(request: CompetitorRequest):
    try:
        # 1. Call the service to get raw analysis from Claude + Tavily
        raw_analysis = await CompetitorService.analyze_competitor(request.query)
        
        # 2. Parse the text into our dictionary format
        parsed = parse_llm_response(raw_analysis)
        
        # 3. Return the structured response
        return CompetitorPulseResponse(
            competitor_handle=request.query,
            summary=parsed["summary"],
            suggestions=CompetitorSuggestion(
                caption=parsed["caption"],
                hashtags=parsed["hashtags"],
                visual_idea=parsed["visual_idea"],
                best_time_to_post=parsed["best_time"],
                why_it_works=parsed["why_it_works"],
                compliance_note=parsed["compliance"]
            ),
            status="success"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))