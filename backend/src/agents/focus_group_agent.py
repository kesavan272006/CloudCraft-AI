from __future__ import annotations
from src.agents.base_agent import BaseAgent, AgentResponse
from typing import List, Dict, Optional, Any
from langchain_core.messages import HumanMessage, SystemMessage
import json

class FocusGroupAgent(BaseAgent):
    name = "Focus Group"
    description = "Simulates distinct personas reacting to content"

    def get_persona_prompt(self, persona: str, trait: str) -> str:
        return f"""
You are a REAL human member of a digital focus group. 
Your persona: {persona}
Your key trait: {trait}

YOUR TASK:
Read the provided content and give a RAW, UNFILTERED reaction as if you just saw this on your social feed. 
Be opinionated. Use the slang, tone, and perspective of your persona.

RULES:
1. Be SHORT. Max 2 sentences.
2. Be HONEST. If it's boring, say it. If it's cringe, say it.
3. Keep it AUTHENTIC. Use emojis naturally if your persona would.
4. Don't sound like an AI. Sound like a human on the internet.
"""

    async def react(self, content: str, persona: str, trait: str) -> str:
        """
        Gives a persona-based reaction to the content.
        """
        role_prompt = self.get_persona_prompt(persona, trait)
        task_prompt = f"CONTENT TO REVIEW:\n{content}\n\nWhat is your first reaction to this?"
        
        try:
            response = await self.llm.ainvoke([
                SystemMessage(content=role_prompt),
                HumanMessage(content=task_prompt)
            ])
            return response.content.strip()
        except Exception as e:
            return f"Error reacting: {str(e)}"
