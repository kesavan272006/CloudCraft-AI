"""
Persona Service - Handles multi-persona content generation
"""
from src.agents.persona_agent import PersonaAgent
from src.core.personas import get_persona, get_all_personas, get_persona_prompt_modifier
from src.models.schemas import PersonaVariant, PersonaResponse, PersonaInfo
from typing import List
import logging

logger = logging.getLogger(__name__)

class PersonaService:
    """Service for generating persona-adapted content variants"""
    
    def __init__(self):
        self.agent = PersonaAgent()
    
    def get_available_personas(self) -> List[PersonaInfo]:
        """Get list of all available personas"""
        personas = get_all_personas()
        return [
            PersonaInfo(
                id=persona_id,
                name=config["name"],
                description=config["description"],
                age_range=config["age_range"],
                platforms=config["platforms"]
            )
            for persona_id, config in personas.items()
        ]
    
    async def generate_persona_variants(
        self, 
        original_content: str, 
        persona_ids: List[str]
    ) -> PersonaResponse:
        """
        Generate content variants for multiple personas
        
        Args:
            original_content: The base content to adapt
            persona_ids: List of persona IDs to generate for
            
        Returns:
            PersonaResponse with all variants
        """
        logger.info(f"Generating variants for {len(persona_ids)} personas")
        
        variants = []
        
        for persona_id in persona_ids:
            try:
                logger.info(f"Generating variant for persona: {persona_id}")
                
                # Get persona configuration
                persona_config = get_persona(persona_id)
                persona_modifier = get_persona_prompt_modifier(persona_id)
                
                # Generate adapted content
                adapted_content = await self.agent.adapt_content(
                    original_content=original_content,
                    persona_modifier=persona_modifier
                )
                
                # Create variant
                variant = PersonaVariant(
                    persona_id=persona_id,
                    persona_name=persona_config["name"],
                    content=adapted_content,
                    platform_suggestion=", ".join(persona_config["platforms"]),
                    tone_used=persona_config["tone"]
                )
                
                variants.append(variant)
                logger.info(f"Successfully generated variant for {persona_id}")
                
            except Exception as e:
                logger.error(f"Error generating variant for {persona_id}: {str(e)}")
                # Continue with other personas even if one fails
                continue
        
        return PersonaResponse(
            original_content=original_content,
            variants=variants,
            status="success" if variants else "partial_failure"
        )

# Global service instance
persona_service = PersonaService()
