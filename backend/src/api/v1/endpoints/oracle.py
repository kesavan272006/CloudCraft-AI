from fastapi import APIRouter, HTTPException
from src.models.schemas import OracleRequest, OracleResponse, MetricScore, TimePoint
from src.core.llm_factory import LLMFactory
from src.services.brand_service import BrandService
import json
import re

router = APIRouter()

@router.post("/predict", response_model=OracleResponse)
async def predict_performance(request: OracleRequest):
    try:
        llm = LLMFactory.get_default_llm()
        tools = LLMFactory.get_tools()
        search_tool = next((t for t in tools if t.name == "web_search"), None)

        # 1. Gather context from the web about current viral trends
        context = ""
        if search_tool:
            search_query = f"current viral social media trends and engagement patterns February 2026"
            context = search_tool.func(search_query)

        # 2. Get Brand Context
        brand_context = await BrandService.get_brand_context()

        # 3. Prompt Claude/Bedrock to act as a Data Scientist
        prompt = f"""
        You are the 'Performance Oracle' AI. Analyze the following content draft against current market trends.
        
        {brand_context}
        
        Current Trends Context:
        {context}
        
        Content to Analyze:
        {request.content}
        
        Task:
        Predict the performance and return ONLY a valid JSON object.
        
        Expected JSON Format:
        {{
            "viral_score": 85,
            "confidence_level": "High",
            "radar_data": [
                {{"subject": "Hook", "score": 90}},
                {{"subject": "Trend", "score": 75}},
                {{"subject": "Clarity", "score": 80}},
                {{"subject": "Value", "score": 85}},
                {{"subject": "CTA", "score": 60}}
            ],
            "forecast_data": [
                {{"time": "1h", "engagement": 120}},
                {{"time": "3h", "engagement": 450}},
                {{"time": "6h", "engagement": 890}},
                {{"time": "12h", "engagement": 1200}},
                {{"time": "24h", "engagement": 1500}}
            ],
            "analysis_report": "Your detailed textual analysis here..."
        }}
        """

        response = llm.invoke(prompt)
        
        # Clean the response to ensure it's pure JSON
        content = response.content
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if not json_match:
            raise ValueError("LLM failed to produce valid JSON")
            
        data = json.loads(json_match.group())

        return OracleResponse(
            viral_score=data["viral_score"],
            confidence_level=data["confidence_level"],
            radar_data=[MetricScore(**m) for m in data["radar_data"]],
            forecast_data=[TimePoint(**t) for t in data["forecast_data"]],
            analysis_report=data["analysis_report"],
            status="success"
        )

    except Exception as e:
        print(f"Oracle Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))