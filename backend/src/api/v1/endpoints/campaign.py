from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
from src.services.campaign_service import CampaignService
from src.services.brand_service import BrandService
from src.agents.marketing_strategist_agent import MarketingStrategistAgent
from src.models.schemas import Campaign, CampaignCreate, CampaignStrategy
import json
import re

router = APIRouter()

agent = MarketingStrategistAgent()

@router.post("/", response_model=Campaign)
def create_campaign(campaign: CampaignCreate):
    return CampaignService.create_campaign(campaign)

@router.get("/", response_model=List[Campaign])
def get_all_campaigns():
    return CampaignService.get_all_campaigns()

@router.post("/{campaign_id}/generate-strategy", response_model=Campaign)
async def generate_strategy(campaign_id: str):
    from fastapi.concurrency import run_in_threadpool
    
    # 1. Get Campaign (Run in threadpool to avoid blocking)
    campaigns = await run_in_threadpool(CampaignService.get_all_campaigns)
    campaign = next((c for c in campaigns if c.id == campaign_id), None)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # 2. Get Brand Context (Run in threadpool as BrandService is now Sync)
    brand_context = await run_in_threadpool(BrandService.get_brand_context)

    # 3. Formulate Prompt
    prompt = f"""
    {brand_context}

    Verify formatting: Output MUST be valid JSON.
    
    TASK: Develop a marketing strategy for the following campaign:
    Name: {campaign.name}
    Goal: {campaign.goal}
    Duration: {campaign.duration}
    Budget: {campaign.budget}
    """

    # 4. Run Agent (Async)
    response = await agent.async_run(prompt)
    output_text = response.output

    # 5. Parse JSON (Robustness)
    try:
        # Strip markdown code blocks if present
        cleaned_json = output_text.strip()
        if cleaned_json.startswith("```json"):
            cleaned_json = cleaned_json[7:]
        if cleaned_json.endswith("```"):
            cleaned_json = cleaned_json[:-3]
        
        strategy_dict = json.loads(cleaned_json.strip())
        strategy = CampaignStrategy(**strategy_dict)
        
        # 6. Save Strategy (Sync in threadpool)
        await run_in_threadpool(CampaignService.update_campaign_strategy, campaign_id, strategy)
        
        # Return updated campaign
        campaign.strategy = strategy
        campaign.status = "active"
        return campaign

    except Exception as e:
        print(f"JSON Parse Error: {output_text}")
        raise HTTPException(status_code=500, detail=f"Failed to generate valid strategy: {str(e)}")
