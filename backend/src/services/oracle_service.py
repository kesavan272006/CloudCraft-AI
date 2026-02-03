
import json
import os
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
import re

from src.core.llm_factory import LLMFactory
from src.utils.logger import get_logger
from src.services.brand_service import BrandService
from src.models.schemas import OracleResponse, OracleHistoryItem, MetricScore, TimePoint

logger = get_logger(__name__)

DATA_DIR = os.path.join(os.getcwd(), "data")
HISTORY_FILE = os.path.join(DATA_DIR, "oracle_history.json")

class OracleService:
    """
    Service for the Performance Oracle.
    """

    @classmethod
    def predict_performance(cls, content: str) -> OracleResponse:
        """
        Synchronous method to be run in threadpool.
        """
        try:
            # 1. Setup LLM & Tools
            llm = LLMFactory.get_default_llm()
            tools = LLMFactory.get_tools()
            search_tool = next((t for t in tools if t.name == "web_search"), None)

            # 2. Web Search (Blocking)
            context = ""
            if search_tool:
                try:
                    search_query = "current viral social media trends and engagement patterns 2026"
                    context = search_tool.func(search_query)
                except Exception as e:
                    logger.warning(f"Oracle search failed: {e}")
                    context = "Assume standard high-engagement patterns."

            # 3. Brand Context
            brand_context = BrandService.get_brand_context()

            # 4. Prompt
            prompt = f"""
            You are the 'Performance Oracle' AI. Analyze the following content draft.
            
            {brand_context}
            
            Market Context:
            {context}
            
            Content to Analyze:
            {content}
            
            Task:
            Predict performance. Return ONLY valid JSON.
            
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
                "analysis_report": "Detailed analysis text..."
            }}
            """

            # 5. Invoke LLM (Blocking)
            response = llm.invoke(prompt)
            
            # 6. Parse JSON
            output_text = response.content
            json_match = re.search(r'\{.*\}', output_text, re.DOTALL)
            if not json_match:
                raise ValueError("LLM failed to produce valid JSON")
            
            data = json.loads(json_match.group())

            result = OracleResponse(
                viral_score=data.get("viral_score", 0),
                confidence_level=data.get("confidence_level", "Medium"),
                radar_data=[MetricScore(**m) for m in data.get("radar_data", [])],
                forecast_data=[TimePoint(**t) for t in data.get("forecast_data", [])],
                analysis_report=data.get("analysis_report", "Analysis failed"),
                status="success"
            )

            # 7. Persist
            cls._save_history(content, result)

            return result

        except Exception as e:
            logger.error(f"Oracle prediction failed: {e}")
            raise e

    @classmethod
    def _save_history(cls, input_content: str, result: OracleResponse):
        """
        Saves prediction to local JSON (Fallback for DynamoDB).
        """
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR)
        
        history = []
        if os.path.exists(HISTORY_FILE):
            try:
                with open(HISTORY_FILE, "r") as f:
                    history = json.load(f)
            except:
                history = []

        item = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now().isoformat(),
            "input_content": input_content,
            "response": result.dict()
        }
        
        history.insert(0, item) # Prepend
        
        with open(HISTORY_FILE, "w") as f:
            json.dump(history, f, indent=2)

    @classmethod
    def get_history(cls) -> List[OracleHistoryItem]:
        if not os.path.exists(HISTORY_FILE):
            return []
        try:
            with open(HISTORY_FILE, "r") as f:
                data = json.load(f)
                return [OracleHistoryItem(**item) for item in data]
        except Exception as e:
            logger.error(f"Failed to load history: {e}")
            return []
