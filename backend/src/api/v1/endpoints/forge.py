from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.agents.supervisor import run_forge_workflow
from src.models.schemas import ForgeResponse, TransmuteRequest, TransmuteResponse
from src.services.brand_service import BrandService
from src.agents.transmuter_agent import TransmuterAgent
from src.utils.logger import get_logger
from typing import List, Dict, Optional, Any
import json
import re

logger = get_logger(__name__)

router = APIRouter()

class ForgeRequest(BaseModel):
    prompt: str
    image_context: Optional[Dict[str, Any]] = None

from fastapi.concurrency import run_in_threadpool

@router.post("/forge", response_model=ForgeResponse)
async def forge_content(request: ForgeRequest):
    try:
        # """
        pass

        # 3. Run the Forge Workflow (LangGraph) with user prompt and optional image context
        result = await run_forge_workflow(
            user_prompt=request.prompt,
            image_context=request.image_context
        )
        
        return ForgeResponse(
            final_content=result["final_content"],
            thoughts=result["thoughts"],
            status="success"
        )
    except Exception as e:
        logger.error(f"Forge failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/transmute", response_model=TransmuteResponse)
async def transmute_content(request: TransmuteRequest):
    """
    Transforms content into a new format or regional language.
    """
    try:
        agent = TransmuterAgent()
        
        task = f"""
        ORIGINAL CONTENT:
        {request.content}
        
        TARGET FORMAT: {request.target_format}
        TARGET LANGUAGE: {request.target_language}
        TONE: {request.tone_modifier or 'Keep original tone'}
        
        Transform this content according to the requested format and language.
        If it's an Indian language, ensure it sounds native and authentic.
        """
        
        response = await agent.async_run(task=task)
        
        # JSON Cleanup & Parsing
        raw_output = response.output.strip()
        
        # Debug logging
        logger.info(f"Transmuter raw output length: {len(raw_output)}")
        logger.debug(f"Transmuter raw output: {raw_output[:500]}")
        
        # Check for empty response
        if not raw_output or len(raw_output) < 10:
            logger.error("Transmuter returned empty or very short output")
            raise HTTPException(
                status_code=500,
                detail="Transmutation failed: The AI returned an empty response. Please try again."
            )
        
        # improved regex to find the largest outer brace pair
        json_match = re.search(r'\{.*\}', raw_output, re.DOTALL)
        if json_match:
            raw_output = json_match.group(0)
        else:
            logger.warning("No JSON object found in transmuter output")
            
        try:
            data = json.loads(raw_output)
        except json.JSONDecodeError as e:
             # Last ditch effort: try cleaning common markdown issues
             logger.warning(f"Initial JSON parse failed: {e}. Attempting cleanup...")
             raw_output = raw_output.replace("```json", "").replace("```", "").strip()
             try:
                 data = json.loads(raw_output)
             except json.JSONDecodeError as e2:
                 logger.error(f"JSON parsing failed completely: {e2}")
                 logger.error(f"Raw output was: {raw_output[:1000]}")
                 raise HTTPException(
                     status_code=500,
                     detail=f"Transmutation failed: Could not parse AI response. The AI may be overloaded. Please try again."
                 )

        return TransmuteResponse(
            transformed_content=data.get("transformed_content", "Error generating content."),
            format_notes=data.get("format_notes", "No notes available."),
            regional_nuance=data.get("regional_nuance", "Standard translation."),
            suggested_tags=data.get("suggested_tags", []),
            estimated_reading_time=data.get("estimated_reading_time", "1 min"),
            status="success"
        )
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        logger.error(f"Transmute Error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Transmutation failed: {str(e)}"
        )