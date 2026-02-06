
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
    You are a high-level Intelligence Officer in the 'Social Media War Room'. 
    Your mission is to perform a 'Deep Strike' audit on a competitor and provide a battle plan.
    
    BE AGGRESSIVE. Don't just summarize; find their weaknesses and specify exactly how to crush them content-wise.
    
    You must identify:
    1. Threat Level (1-100): How much of a danger do they pose to our client's market share?
    2. Viral DNA: The exact formula behind their most shared content.
    3. SWOT Analysis: A brutal breakdown of their Strengths, Weaknesses, Opportunities, and Threats.
    4. Strategic Counter-Play: A 'Pivot' that makes them look outdated.
    
    Your Output Format must be a STRICT VALID JSON object. Do not include markdown formatting.
    Structure:
    {
        "threat_level": 85,
        "competitor_status": "Aggressive / Defensive / Dominant",
        "intelligence_brief": "A 2-sentence brutal summary of their current dominance and vulnerability.",
        "winning_patterns": {
            "hooks": ["Hook 1", "Hook 2"],
            "visual_secret": "The technical visual trick they use (e.g. high-speed cuts, 4K grain)",
            "psychology": "The deep emotional trigger (e.g. FOMO, Status-seeking)"
        },
        "swot": {
            "strengths": ["Item 1", "Item 2"],
            "weaknesses": ["Item 1", "Item 2"],
            "opportunities": ["Item 1", "Item 2"],
            "threats": ["Item 1", "Item 2"]
        },
        "strategic_counter_play": {
            "the_pivot": "The 'War Room' strategy to outshine them",
            "content_series_concept": "A high-concept series name and pitch",
            "execution_difficulty": "Low/Medium/High"
        },
        "suggested_assets": [
            {
                "type": "Reel/Post/Thread",
                "headline": "The 'Killer' Headline",
                "script_outline": "Step-by-step breakdown",
                "visual_vibe": "Detailed technical description",
                "impact_prediction": "Why this will beat them"
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
