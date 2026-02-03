from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.agents.supervisor import run_forge_workflow
from src.models.schemas import ForgeResponse
from src.services.brand_service import BrandService

router = APIRouter()

class ForgeRequest(BaseModel):
    prompt: str

from fastapi.concurrency import run_in_threadpool

@router.post("/forge", response_model=ForgeResponse)
async def forge_content(request: ForgeRequest):
    try:
        # 1. Get Brand Context
        brand_context = await run_in_threadpool(BrandService.get_brand_context)
        
        # 2. Enrich the prompt with brand identity
        enriched_prompt = f"""
        {brand_context}
        
        USER REQUEST:
        {request.prompt}
        """

        # 3. Run the Forge Workflow (LangGraph)
        result = await run_forge_workflow(enriched_prompt)
        
        return ForgeResponse(
            final_content=result["final_content"],
            thoughts=result["thoughts"],
            status="success"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))