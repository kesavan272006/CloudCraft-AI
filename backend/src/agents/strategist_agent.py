from __future__ import annotations
from src.agents.base_agent import BaseAgent, AgentResponse
from typing import List, Dict, Optional, Any
from langchain_core.messages import HumanMessage, SystemMessage
import json

class StrategistAgent(BaseAgent):
    name = "Campaign Strategist"
    description = "Optimizes live campaign performance via autonomous pivots"

    role_prompt = """
You are the Campaign Strategist. Your job is to monitor live performance data and decide if a content pivot is needed.

SCENARIO:
A campaign is live. You are given the current metrics (Likes, CTR, CPM) and the target.

YOUR TASK:
1. Analyze the gap between current and target.
2. If the gap is significant, identify WHAT to fix (Hook, Visual, CTA, or Body).
3. Provide a clear "PIVOT DIRECTIVE" for the other agents.

RESPONSE FORMAT (JSON):
{
    "status": "KEEP" or "PIVOT",
    "analysis": "one sentence analysis",
    "primary_issue": "Visual" | "Hook" | "CTA" | "None",
    "directive": "Specific instructions for the pivot if status is PIVOT",
    "revised_target": "New expected score"
}
"""

    async def decide_pivot(self, metrics: Dict[str, Any], content: str) -> Dict[str, Any]:
        """
        Decides whether to pivot or maintain current strategy.
        """
        task_prompt = f"""
CURRENT CONTENT: {content}
CURRENT METRICS: {json.dumps(metrics)}

DECISION: Should we pivot?
"""
        try:
            response = await self.llm.ainvoke([
                SystemMessage(content=self.role_prompt),
                HumanMessage(content=task_prompt)
            ])
            # Parse JSON
            raw = response.content.strip()
            if "```json" in raw:
                raw = raw.split("```json")[1].split("```")[0].strip()
            return json.loads(raw)
        except Exception as e:
            return {"status": "KEEP", "analysis": f"Error deciding: {str(e)}", "directive": ""}
