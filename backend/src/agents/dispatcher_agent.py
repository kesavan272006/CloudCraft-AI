from __future__ import annotations
from src.agents.base_agent import BaseAgent, AgentResponse
from typing import List, Dict, Optional, Any
import httpx
from src.utils.logger import get_logger

logger = get_logger(__name__)

class DispatcherAgent(BaseAgent):
    name = "Nexus Dispatcher"
    description = "Audits content for trending hashtags and dispatches to webhooks"

    def get_role_prompt(self, platform: str) -> str:
        return f"""
You are the Nexus Dispatcher. Your job is to perform a final "Pre-Flight Audit" on content before it goes live.

MISSION:
1. Review the content for the {platform} platform.
2. Add 2-3 POWERFUL, trending hashtags relevant to the topic.
3. If the content is for X (Twitter), ensure it's punchy. 
4. If for LinkedIn, ensure it has a professional hook.
5. Return the FINAL content ready to be posted.

CRITICAL:
- Do NOT change the core message.
- ONLY return the final text.
- No commentary or "Here is your audited post".
"""

    async def async_run(self, task: str, context: dict = None, history: list = None) -> AgentResponse:
        platform = context.get("platform", "General") if context else "General"
        role_prompt = self.get_role_prompt(platform)
        
        from langchain_core.messages import HumanMessage
        
        try:
            full_prompt = f"{role_prompt}\n\nCONTENT TO AUDIT:\n{task}"
            response = await self.llm.ainvoke([HumanMessage(content=full_prompt)])
            final_content = response.content.strip()
            
            return AgentResponse(
                thought=f"Audited content for {platform} and optimized hashtags.",
                output=final_content,
                confidence=0.95,
                needs_more_info=False
            )
        except Exception as e:
            return AgentResponse(
                thought=f"Error in audit: {str(e)}",
                output=task, # Fallback to original
                confidence=0.5,
                needs_more_info=False
            )

    async def dispatch(self, content: str, platform: str, webhook_url: str) -> bool:
        """
        Final action: Hits the webhook to trigger the real post.
        """
        # Step 1: Final Audit
        audit_result = await self.async_run(task=content, context={"platform": platform})
        final_payload = audit_result.output
        
        logger.info(f"Dispatching to {platform} via {webhook_url}")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    webhook_url, 
                    json={
                        "platform": platform,
                        "content": final_payload,
                        "source": "CloudCraft AI Nexus",
                        "timestamp": str(httpx.utils.get_ca_bundle_from_env()) # Just placeholder
                    },
                    timeout=10.0
                )
                return response.status_code < 400
        except Exception as e:
            logger.error(f"Webhook dispatch failed: {str(e)}")
            return False
