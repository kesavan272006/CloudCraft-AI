from __future__ import annotations
from src.agents.base_agent import BaseAgent, AgentResponse
from typing import List, Dict, Optional, Any

class PersonaAgent(BaseAgent):
    name = "Persona Adapter"
    description = "Adapts content for different audience personas"

    def get_role_prompt(self, persona_modifier: str) -> str:
        """Get role prompt with persona-specific instructions"""
        return f"""
You are the Persona Adapter - an expert at tailoring content for specific audiences.

YOUR MISSION:
Take the "Original Content" and COMPLETELY REWRITE it to sound like the target audience. 
If the audience is Gen-Z, use their slang and rapid-fire rhythm. 
If it's Professional, use industry logic and sophisticated vocabulary.

{persona_modifier}

CRITICAL RULES:
1. DO NOT REPEAT THE ORIGINAL TEXT - Every sentence must be adapted.
2. CHANGE THE HOOK - Use a hook that works for THIS specific persona.
3. ADAPT ALL ELEMENTS:
   - Vocabulary: Use words specific to their lifestyle.
   - Tone: Funny, serious, empathetic, or bold as required.
   - Cultural references: Mention things they care about.
   - Emoji usage: Match their natural digital behavior.
   - Call-to-action: Use a closing that they would actually respond to.

4. BE AUTHENTIC - Sound natural, like a member of that tribe, not like an AI trying to fit in.
5. PLATFORM FIT - Ensure the length and style match where this audience hangs out.

OUTPUT FORMAT:
Return ONLY the adapted content. No explanations, no "Here is the adapted content", no "Output:".
Just the final, persona-optimized content ready to post.
"""

    async def async_run(self, task: str, context: dict = None, history: list = None) -> AgentResponse:
        """Override to use persona-specific prompt logic"""
        from langchain_core.messages import HumanMessage
        
        # Build the specific system prompt from context
        persona_modifier = context.get("persona_modifier", "") if context else ""
        role_prompt = self.get_role_prompt(persona_modifier)
        
        try:
            # We use a combined prompt for persona adaptation to keep it simple and direct
            full_prompt = f"{role_prompt}\n\n{task}"
            
            response = await self.llm.ainvoke([HumanMessage(content=full_prompt)])
            raw_output = response.content.strip()
            
            return AgentResponse(
                thought=f"Adapted content based on {persona_modifier[:50]}...",
                output=raw_output,
                confidence=0.9,
                needs_more_info=False
            )
        except Exception as e:
            return AgentResponse(
                thought=f"Error: {str(e)}",
                output="Failed to adapt content.",
                confidence=0.0,
                needs_more_info=True
            )

    async def adapt_content(self, original_content: str, persona_modifier: str) -> str:
        """
        Adapt content for a specific persona
        """
        task = f"ORIGINAL CONTENT:\n{original_content}\n\nAdapt this for the target audience."
        result = await self.async_run(task, context={"persona_modifier": persona_modifier})
        return result.output.strip()
