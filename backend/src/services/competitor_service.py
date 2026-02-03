from src.core.llm_factory import LLMFactory
from src.utils.logger import get_logger
from src.services.brand_service import BrandService

logger = get_logger(__name__)

class CompetitorService:
    @staticmethod
    async def analyze_competitor(query: str):
        llm = LLMFactory.get_default_llm()
        tools = LLMFactory.get_tools()
        search_tool = next((t for t in tools if t.name == "web_search"), None)

        if not search_tool:
            raise RuntimeError("Web search tool is not available")

        # 1. Search for competitor pulse
        search_query = f"latest viral instagram posts and reels content by {query} 2025 2026"
        search_results = search_tool.func(search_query)

        # 2. Get Brand Context
        brand_context = await BrandService.get_brand_context()

        # 3. Analyze with LLM
        prompt = f"""
        You are an elite Social Media Strategist. 
        
        {brand_context}
        
        Analyze these search results for the competitor/niche: '{query}'
        
        Search Results:
        {search_results}
        
        Task:
        1. Summarize their current content strategy.
        2. Provide ONE viral-ready suggestion tailored for OUR BRAND based on their success.
        
        Return the response in this EXACT format:
        SUMMARY: [Brief summary]
        SUGGESTED CAPTION: [Caption text in our brand voice]
        HASHTAGS: [#tag1, #tag2]
        VISUAL IDEA: [Description of the reel/post visual]
        BEST TIME: [e.g. 7 PM IST]
        WHY IT WORKS: [Psychological trigger or trend reason]
        COMPLIANCE: [Originality check note]
        """

        response = llm.invoke(prompt)
        # Parse logic here (we can make this more robust with Pydantic output parsers later)
        return response.content