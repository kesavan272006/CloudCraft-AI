from .base_agent import BaseAgent
from typing import List

class PersonaAgent(BaseAgent):
    name = "Persona Adapter"
    description = "Adapts content for different audience personas"

    def get_role_prompt(self, persona_modifier: str) -> str:
        """Get role prompt with persona-specific instructions"""
        return f"""
You are the Persona Adapter - an expert at tailoring content for specific audiences.

YOUR TASK:
Transform the given content to perfectly match the target audience persona.

{persona_modifier}

CRITICAL RULES:
1. MAINTAIN THE CORE MESSAGE - Don't change what you're saying, change HOW you say it
2. ADAPT EVERYTHING:
   - Language style and vocabulary
   - Tone and emotion
   - Cultural references
   - Emoji usage
   - Sentence structure
   - Call-to-action style

3. BE AUTHENTIC - Sound natural for that persona, not forced
4. PLATFORM AWARENESS - Consider where this content will be posted
5. LENGTH - Keep it appropriate for the platform and audience attention span

OUTPUT FORMAT:
Return ONLY the adapted content. No explanations, no meta-commentary.
Just the final, persona-optimized content ready to post.
"""

    def adapt_content(self, original_content: str, persona_modifier: str) -> str:
        """
        Adapt content for a specific persona
        
        Args:
            original_content: The original content to adapt
            persona_modifier: Persona-specific instructions
            
        Returns:
            Adapted content as string
        """
        role_prompt = self.get_role_prompt(persona_modifier)
        
        task = f"""
ORIGINAL CONTENT:
{original_content}

Transform this content according to the persona guidelines above.
"""
        
        result = self.run(task, system_prompt=role_prompt)
        return result.strip()
