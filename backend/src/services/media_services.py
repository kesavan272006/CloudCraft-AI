import os
import requests
from src.core.llm_factory import LLMFactory
from src.utils.logger import get_logger

logger = get_logger(__name__)

class MediaService:
    @staticmethod
    async def generate_enhanced_image(user_prompt: str):
        """
        The Vision Lab Engine:
        1. Expands user idea into a pro Flux prompt using Nemotron.
        2. Generates an authenticated Pollinations URL using your API Key.
        """
        # 1. Prompt Expansion (The Brain)
        llm = LLMFactory.get_llm(provider="openrouter")
        expansion_prompt = f"""
        Expand the following user idea into a highly detailed, cinematic prompt for Flux AI.
        Include camera specs (e.g., 85mm lens), lighting (e.g., volumetric), and specific textures.
        User Idea: {user_prompt}
        
        Return ONLY the expanded prompt text.
        """
        
        try:
            expanded_res = await llm.ainvoke(expansion_prompt)
            refined_prompt = expanded_res.content.strip()
        except Exception as e:
            logger.error(f"LLM Expansion failed: {e}")
            refined_prompt = user_prompt # Fallback to original if LLM fails

        # 2. Authenticated Generation (The Artist)
        # We use the sk_ key from your .env
        api_key = os.getenv("POLLINATIONS_API_KEY")
        
        # URL encode the prompt so it's safe for a web link
        encoded_prompt = requests.utils.quote(refined_prompt)

        # 🎯 THE FIX: According to Pollinations Docs, the easiest way to use 
        # your key for an image URL is the 'key=' query parameter.
        # This makes the URL itself authenticated so it uses your Spore Tier credits.
        auth_image_url = (
            f"https://gen.pollinations.ai/image/{encoded_prompt}"
            f"?model=flux&width=1024&height=1024&nologo=true&key={api_key}"
        )

        logger.info(f"Generated Vision Lab URL for: {user_prompt[:30]}...")

        return {
            "refined_prompt": refined_prompt,
            "image_url": auth_image_url
        }