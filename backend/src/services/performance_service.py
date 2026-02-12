"""
Performance Prediction Service
Orchestrates performance analysis for content.
"""

from typing import Dict, Any, List
from src.agents.performance_agent import PerformanceAgent


class PerformanceService:
    """Service for analyzing content performance predictions."""
    
    def __init__(self):
        self.performance_agent = PerformanceAgent()
    
    def analyze_content(
        self,
        content: str,
        platform: str = "General",
        persona: str = "General"
    ) -> Dict[str, Any]:
        """
        Analyze content and return performance predictions.
        
        Args:
            content: Content to analyze
            platform: Target platform
            persona: Target persona
            
        Returns:
            Performance prediction data
        """
        try:
            prediction = self.performance_agent.analyze_performance(
                content=content,
                platform=platform,
                persona=persona
            )
            
            return {
                "content": content,
                "platform": platform,
                "persona": persona,
                "prediction": prediction,
                "status": "success"
            }
            
        except Exception as e:
            print(f"Performance service error: {e}")
            return {
                "content": content,
                "platform": platform,
                "persona": persona,
                "prediction": self._get_fallback_prediction(),
                "status": "error",
                "error": str(e)
            }
    
    def compare_variants(
        self,
        variants: List[Dict[str, str]]
    ) -> List[Dict[str, Any]]:
        """
        Analyze multiple content variants and compare performance.
        
        Args:
            variants: List of {content, platform, persona} dicts
            
        Returns:
            List of predictions with rankings
        """
        results = []
        
        for variant in variants:
            prediction = self.analyze_content(
                content=variant.get("content", ""),
                platform=variant.get("platform", "General"),
                persona=variant.get("persona", "General")
            )
            results.append(prediction)
        
        # Sort by overall score
        results.sort(
            key=lambda x: x["prediction"].get("overall_score", 0),
            reverse=True
        )
        
        # Add rankings
        for i, result in enumerate(results):
            result["rank"] = i + 1
        
        return results
    
    def _get_fallback_prediction(self) -> Dict[str, Any]:
        """Return basic prediction if analysis fails."""
        return {
            "overall_score": 70,
            "engagement_potential": 70,
            "platform_fit": 65,
            "audience_alignment": 70,
            "virality_score": 60,
            "predicted_metrics": {
                "likes": 1000,
                "shares": 200,
                "comments": 60,
                "reach": 6000
            },
            "best_platform": "LinkedIn",
            "best_posting_time": "Tuesday 10:00 AM",
            "strengths": ["Clear content"],
            "improvements": ["Add visuals"],
            "confidence": "medium"
        }
