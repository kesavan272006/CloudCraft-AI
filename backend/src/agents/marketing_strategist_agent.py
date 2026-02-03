
import asyncio
from typing import Any, Dict, Optional
from src.core.llm_factory import LLMFactory
from .base_agent import BaseAgent, AgentResponse
from ..utils.logger import get_logger

logger = get_logger(__name__)

class MarketingStrategistAgent(BaseAgent):
    """
    Expert Strategist agent.
    Analyzes raw input (URL, Product Desc, PDF) and creates a master Campaign Strategy.
    This strategy acts as the DNA for all downstream content generation.
    """

    name = "MarketingStrategist"
    description = "Develops high-level content strategy, USP analysis, and audience targeting."

    role_prompt = """
    You are the Chief Marketing Strategist for a Fortune 500 company.
    Your goal is to take a raw input (a URL, a product description, or a trend) and deconstruct it into a winning Campaign Strategy.

    Your analysis must be sharp, modern, and actionable.

    Your Output Format must be a STRICT VALID JSON object. Do not include markdown formatting (```json).
    Structure:
    {
        "core_concept": "One sentence hook",
        "target_audience": [
            {"segment_name": "Segment 1", "pain_point": "Pain Point 1"},
            {"segment_name": "Segment 2", "pain_point": "Pain Point 2"}
        ],
        "usps": ["USP 1", "USP 2", "USP 3"],
        "tone": "e.g., Witty, Professional",
        "tagline": "Catchy Tagline",
        "visual_direction": "Brief description of visual vibe"
    }
    """

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Strategy requires reasoning -> High Temp or specialized model if available
        self.llm = LLMFactory.get_default_llm()

    async def async_run(
        self,
        task: str,
        context: Optional[Dict[str, Any]] = None,
        history: Optional[list] = None,
    ) -> AgentResponse:
        """
        Executes the strategy analysis.
        """
        logger.info(f"MarketingStrategist analyzing: {task[:50]}...")
        return await super().async_run(task, context, history)
