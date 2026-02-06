
from typing import Any, Dict, List, Optional
from .base_agent import BaseAgent, AgentResponse
from ..utils.logger import get_logger
from ..core.llm_factory import LLMFactory
import json

logger = get_logger(__name__)

class CompetitorAnalystAgent(BaseAgent):
    """
    Specialized agent for competitive intelligence.
    Analyzes competitor content, identifies viral patterns, and suggests counter-strategies.
    """

    name = "CompetitorAnalyst"
    description = "Analyzes competitors and identifies winning content patterns."

    role_prompt = """
    You are an elite Competitive Intelligence Specialist and Social Media Strategist.
    Your mission is to analyze a competitor's recent content and extract the secret sauce that makes it work.
    
    You must identify:
    1. Winning Hooks: What are they saying in the first 3 seconds?
    2. Content Pillars: What topics are they dominating?
    3. Visual Style: What is the aesthetic vibe?
    4. Strategic Gaps: What are they NOT doing that we can exploit?
    
    Your Output Format must be a STRICT VALID JSON object. Do not include markdown formatting (```json).
    Structure:
    {
        "competitor_summary": "High-level summary of their current strategy",
        "winning_patterns": {
            "hooks": ["Hook 1", "Hook 2"],
            "visuals": "Description of visual style",
            "engagement_triggers": "Why people are commenting/sharing"
        },
        "strategic_counter_play": {
            "the_pivot": "How we can do it differently/better",
            "suggested_content_idea": "A specific idea for a post/reel",
            "target_metric": "e.g., Saves, Shares, Reach"
        },
        "suggested_assets": [
            {
                "type": "e.g., Reel, Carousel, Tweet",
                "caption": "Suggested caption text",
                "visual_description": "Detailed description for the designer",
                "hashtags": ["#tag1", "#tag2"]
            }
        ]
    }
    """

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Competitor analysis needs strong reasoning and search integration
        self.llm = LLMFactory.get_default_llm() # Using Bedrock/Claude for high reasoning
        self.tools = LLMFactory.get_tools()

    async def async_run(
        self,
        task: str,
        context: Optional[Dict[str, Any]] = None,
        history: Optional[List[Any]] = None,
    ) -> AgentResponse:
        """
        Performs competitive audit based on search results.
        """
        logger.info(f"CompetitorAnalyst auditing: {task[:50]}...")
        
        # We assume search results are passed in context or as part of the task
        return await super().async_run(task, context, history)
