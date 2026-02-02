from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import base64
import json
from langchain_aws import ChatBedrock
from langchain_core.messages import HumanMessage
from src.core.llm_factory import LLMFactory
from src.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

# Response Models
class VisionAnalysisResponse(BaseModel):
    detected_elements: List[str]
    mood: str
    mood_description: str
    dominant_colors: List[str]  # Hex codes
    caption_idea: str
    edit_suggestion: str

@router.post("/vision/analyze", response_model=VisionAnalysisResponse)
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyzes an uploaded image using Amazon Nova Lite (Multimodal).
    Returns content tags, mood, colors, and captions.
    """
    try:
        # 1. Read and validate image
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        contents = await file.read()
        encoded_image = base64.b64encode(contents).decode("utf-8")
        
        # 2. Get LLM (Nova Lite)
        # Note: We specifically request Nova Lite or a model capable of vision
        llm = LLMFactory.get_llm(provider="bedrock") 
        
        # 3. Construct Multimodal Prompt
        # We ask for JSON output to easily parse in frontend
        prompt_text = """
        Analyze this image for a social media content creator. Provide the output in strict JSON format with the following keys:
        - "detected_elements": list of 5-8 strings (objects, scenery, key elements)
        - "mood": short title (e.g. "Serene & Nostalgic")
        - "mood_description": 1 short sentence describing the vibe
        - "dominant_colors": list of 4 hex color codes found in the image
        - "caption_idea": a creative, engaging caption with hashtags
        - "edit_suggestion": a specific tip to improve the photo (e.g. "Increase warmth...")
        
        Do not add any markdown formatting or explanations, just the raw JSON.
        """
        
        message = HumanMessage(
            content=[
                {"type": "text", "text": prompt_text},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{file.content_type};base64,{encoded_image}"
                    },
                },
            ]
        )
        
        # 4. Invoke Model
        logger.info("Sending image to Amazon Bedrock (Nova Lite)...")
        response = await llm.ainvoke([message])
        content = response.content.strip()
        
        # 5. Parse JSON
        # Clean up possible markdown fences if the model adds them
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "")
        elif content.startswith("```"):
            content = content.replace("```", "")
            
        data = json.loads(content)
        
        return VisionAnalysisResponse(
            detected_elements=data.get("detected_elements", []),
            mood=data.get("mood", "Unknown"),
            mood_description=data.get("mood_description", ""),
            dominant_colors=data.get("dominant_colors", ["#000000"]),
            caption_idea=data.get("caption_idea", ""),
            edit_suggestion=data.get("edit_suggestion", "")
        )

    except json.JSONDecodeError:
        logger.error(f"Failed to parse LLM response: {content}")
        raise HTTPException(status_code=500, detail="AI response was not valid JSON. Please try again.")
    except Exception as e:
        logger.error(f"Vision analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
