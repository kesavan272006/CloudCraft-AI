import json
import re
from src.core.llm_factory import LLMFactory
from src.utils.logger import get_logger
from src.services.brand_service import BrandService

logger = get_logger(__name__)

class LocalScoutService:
    @staticmethod
    async def get_localized_insights(city: str, lat: float, lng: float):
        llm = LLMFactory.get_llm() # Defaults to Bedrock
        tools = LLMFactory.get_tools()
        search_tool = next((t for t in tools if t.name == "web_search"), None)

        if not search_tool:
            return {"error": "Search tool unavailable"}

        # 1. Get Brand Context
        brand_context = BrandService.get_brand_context()

        # 2. Search for local data
        search_query = f"latest viral trends events food spots news {city} Kerala February 2026 reddit"
        raw_search_data = search_tool.func(search_query)

        # 3. Synthesis into JSON
        # We instruct Nemotron to strictly follow a JSON format and consider Brand Audience
        final_analysis_prompt = f"""
        You are an NVIDIA-powered Local Scout Agent.
        Location: {city}, Kerala.
        
        {brand_context}
        
        RAW RESEARCH DATA:
        {raw_search_data}
        
        Task: 
        Summarize this data into a structured JSON object.
        IMPORTANT: Filter trends that match our Target Audience defined above.
        
        STRICT JSON FORMAT:
        {{
            "local_vibe": "Summary of the city's mood",
            "viral_hooks": [
                {{"title": "Hook 1", "description": "Details"}},
                {{"title": "Hook 2", "description": "Details"}},
                {{"title": "Hook 3", "description": "Details"}}
            ],
            "strategic_recommendation": "One specific post idea for OUR BRAND",
            "sentiment_score": 85,
            "trending_hashtags": ["#tag1", "#tag2"]
        }}
        
        Return ONLY the JSON. No conversational text.
        """

        response = llm.invoke(final_analysis_prompt)
        
        # 3. Use the 'json' library to clean and parse the output
        try:
            # We use regex to find the JSON block in case the LLM added extra text
            json_match = re.search(r'\{.*\}', response.content, re.DOTALL)
            if json_match:
                json_data = json.loads(json_match.group())
                return json_data
            else:
                raise ValueError("No JSON found in response")
        except Exception as e:
            logger.error(f"JSON Parsing Error: {e}")
            # Fallback in case parsing fails
            return {
                "local_vibe": response.content[:100],
                "viral_hooks": [],
                "strategic_recommendation": "Analysis complete but format was irregular.",
                "sentiment_score": 50,
                "trending_hashtags": []
            }