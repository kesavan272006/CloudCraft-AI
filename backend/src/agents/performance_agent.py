"""
Performance Prediction Agent
Analyzes content and predicts engagement metrics and performance scores.
"""

from typing import Dict, Any
import json
from src.agents.base_agent import BaseAgent


class PerformanceAgent(BaseAgent):
    """Agent that predicts content performance and engagement metrics."""
    
    role_prompt = """
You are a Social Media Performance Analyst AI. Your job is to analyze content and predict its performance.

ANALYSIS CRITERIA:
1. **Engagement Potential** (0-100):
   - Hook strength (first 3 words)
   - Emotional resonance
   - Call-to-action clarity
   - Visual appeal indicators
   - Shareability factor

2. **Platform Fit** (0-100):
   - Content length appropriateness
   - Format suitability
   - Trending topic alignment
   - Platform-specific best practices

3. **Audience Alignment** (0-100):
   - Language complexity
   - Tone appropriateness
   - Cultural relevance
   - Value proposition clarity

4. **Virality Score** (0-100):
   - Controversy/debate potential
   - Emotional trigger strength
   - Novelty factor
   - Share-worthiness

PREDICTION METRICS:
- Estimated Likes: Realistic number based on content quality
- Estimated Shares: Based on shareability
- Estimated Comments: Based on engagement triggers
- Best Posting Time: When target audience is most active
- Optimal Platform: Where this content will perform best

RESPONSE FORMAT (JSON):
{
  "overall_score": 85,
  "engagement_potential": 88,
  "platform_fit": 82,
  "audience_alignment": 90,
  "virality_score": 75,
  "predicted_metrics": {
    "likes": 2500,
    "shares": 450,
    "comments": 180,
    "reach": 15000
  },
  "best_platform": "LinkedIn",
  "best_posting_time": "Tuesday 9:00 AM",
  "strengths": [
    "Strong opening hook",
    "Clear value proposition",
    "Actionable insights"
  ],
  "improvements": [
    "Add more visual elements",
    "Include a stronger CTA"
  ],
  "confidence": "high"
}

IMPORTANT:
- Be realistic with predictions
- Consider content length and format
- Factor in current trends
- Provide actionable feedback
- Return ONLY valid JSON
"""

    def analyze_performance(self, content: str, platform: str = "General", persona: str = "General") -> Dict[str, Any]:
        """
        Analyze content and predict performance metrics.
        
        Args:
            content: The content to analyze
            platform: Target platform (LinkedIn, Twitter, Instagram, etc.)
            persona: Target persona (Gen-Z, Professional, etc.)
            
        Returns:
            Dictionary containing performance predictions
        """
        analysis_prompt = f"""
Analyze this content for {platform} targeting {persona} audience:

CONTENT:
{content}

Provide detailed performance prediction with realistic metrics.
Return ONLY valid JSON matching the specified format.
"""
        
        try:
            response = self.chat(analysis_prompt)
            
            # Extract JSON from response
            response_text = response.strip()
            
            # Try to find JSON in the response
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()
            elif "```" in response_text:
                json_start = response_text.find("```") + 3
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()
            
            # Parse JSON
            result = json.loads(response_text)
            
            # Ensure all required fields exist
            if "overall_score" not in result:
                result["overall_score"] = 75
            if "predicted_metrics" not in result:
                result["predicted_metrics"] = {
                    "likes": 1000,
                    "shares": 200,
                    "comments": 50,
                    "reach": 5000
                }
            if "strengths" not in result:
                result["strengths"] = ["Engaging content"]
            if "improvements" not in result:
                result["improvements"] = ["Consider adding visuals"]
                
            return result
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Response was: {response}")
            # Return fallback prediction
            return self._fallback_prediction()
        except Exception as e:
            print(f"Performance analysis error: {e}")
            return self._fallback_prediction()
    
    def _fallback_prediction(self) -> Dict[str, Any]:
        """Return a basic prediction if analysis fails."""
        return {
            "overall_score": 75,
            "engagement_potential": 75,
            "platform_fit": 70,
            "audience_alignment": 75,
            "virality_score": 65,
            "predicted_metrics": {
                "likes": 1200,
                "shares": 250,
                "comments": 80,
                "reach": 8000
            },
            "best_platform": "LinkedIn",
            "best_posting_time": "Tuesday 10:00 AM",
            "strengths": [
                "Clear messaging",
                "Professional tone"
            ],
            "improvements": [
                "Add visual elements",
                "Include call-to-action"
            ],
            "confidence": "medium"
        }
