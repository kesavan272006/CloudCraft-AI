import json
from src.core.llm_factory import LLMFactory
from src.utils.logger import get_logger
from src.services.brand_service import BrandService
from src.agents.competitor_analyst_agent import CompetitorAnalystAgent

logger = get_logger(__name__)

class CompetitorService:
    """
    Orchestrates the Competitor Pulse feature.
    Uses Tavily for research and CompetitorAnalystAgent for intelligence.
    """

    @staticmethod
    async def analyze_competitor(query: str):
        """
        Main entry point for competitor pulse.
        1. Search for latest content/trends.
        2. Analyze with specialized agent.
        3. Return structured data.
        """
        logger.info(f"Starting Competitor Pulse for: {query}")
        
        # 1. Get Tools & Brand Context
        tools = LLMFactory.get_tools()
        search_tool = next((t for t in tools if t.name == "web_search"), None)
        
        if not search_tool:
            logger.error("Web search tool not configured!")
            raise RuntimeError("Web search tool is not available")

        brand_context = BrandService.get_brand_context()

        # 2. Perform Deep Search
        # We look for viral content, strategy breakdowns, and recent news
        search_queries = [
            f"latest viral social media posts by {query} 2025-2026",
            f"{query} marketing strategy breakdown 2025",
            f"what is {query} doing on instagram reels and tiktok recently"
        ]
        
        search_results = []
        for q in search_queries:
            try:
                # search_tool.func is the Tavily process
                res = search_tool.func(q)
                search_results.append(res)
            except Exception as e:
                logger.warning(f"Search failed for query '{q}': {e}")

        # 3. Intelligence Analysis
        analyst = CompetitorAnalystAgent()
        
        analysis_task = f"""
        Perform a deep competitive audit of '{query}'.
        
        CONTEXT (Our Brand):
        {brand_context}
        
        RESEARCH DATA (Competitor):
        {json.dumps(search_results)}
        
        Identify why they are winning and how we can counter-play.
        """
        
        try:
            agent_response = await analyst.async_run(task=analysis_task)
            
            # The agent outputs JSON (as per its role_prompt)
            # We want to ensure it's clean for the API
            raw_content = agent_response.output.strip()
            
            # Check for markdown wrappers and strip them if the agent ignored instructions
            if raw_content.startswith("```json"):
                raw_content = raw_content.replace("```json", "", 1).replace("```", "", 1).strip()
            elif raw_content.startswith("```"):
                raw_content = raw_content.replace("```", "", 1).replace("```", "", 1).strip()
                
            return raw_content
            
        except Exception as e:
            logger.error(f"Competitor Intelligence failed: {e}")
            raise RuntimeError(f"Failed to analyze competitor: {str(e)}")