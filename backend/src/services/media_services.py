import json
import base64
import os
import requests
from src.core.llm_factory import LLMFactory
from src.core.config import settings
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
        # We use Amazon Nova Lite for the prompt intelligence
        llm = LLMFactory.get_llm(provider="bedrock", model_id="amazon.nova-lite-v1:0")
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
            logger.error(f"Bedrock Expansion failed: {e}")
            refined_prompt = user_prompt # Fallback to original if Bedrock fails

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

    @staticmethod
    async def analyze_image(image_base64: str) -> dict:
        """
        The Vision Lab Audit:
        Uses OpenRouter (GPT-4o-Mini) for rock-solid vision analysis.
        """
        try:
            # GPT-4o-Mini is extremely reliable for vision over OpenRouter
            llm = LLMFactory.get_llm(provider="openrouter", model_id="openai/gpt-4o-mini")
            
            # Ensure base64 prefix is correct
            if not image_base64.startswith("data:"):
                img_url = f"data:image/jpeg;base64,{image_base64}"
            else:
                img_url = image_base64

            content = [
                {
                    "type": "text", 
                    "text": """Analyze this image and return JSON ONLY. 
                
                STRICT SCHEMA CONSTRAINTS:
                - detected_context: MUST be a single string (not a list/dict) describing the subject (e.g. 'A professional man with glasses in a striped shirt').
                - aesthetic_audit.brightness: MUST be a float between 0.1 and 2.0.
                - aesthetic_audit.contrast: MUST be a float between 0.1 and 2.0.
                - aesthetic_audit.saturation: MUST be a float between 0.1 and 2.0.
                - aesthetic_audit.clarity_score: MUST be an integer between 0 and 100.
                
                Fields to return: vibe_description, detected_context, suggested_tone, aesthetic_audit (brightness, contrast, saturation, temperature, clarity_score, pro_tip)."""
                },
                {
                    "type": "image_url",
                    "image_url": { "url": img_url }
                }
            ]
            
            from langchain_core.messages import HumanMessage
            res = await llm.ainvoke([HumanMessage(content=content)])
            
            raw_text = res.content
            # Multi-lap cleaning for JSON
            json_text = raw_text.replace("```json", "").replace("```", "").strip()
            data = json.loads(json_text)

            # --- SANITIZATION LAYER (Prevent Validation Errors) ---
            # Ensure detected_context is a string
            if isinstance(data.get("detected_context"), (dict, list)):
                data["detected_context"] = str(data["detected_context"])
            
            # Sanitize aesthetic_audit
            audit = data.get("aesthetic_audit", {})
            if not isinstance(audit, dict):
                audit = {}
            
            # Force numeric types
            for field in ["brightness", "contrast", "saturation"]:
                val = audit.get(field)
                try:
                    audit[field] = float(val) if val is not None else 1.0
                except (ValueError, TypeError):
                    audit[field] = 1.0
            
            # Force integrity for temperature (MUST be string)
            if audit.get("temperature") is None:
                audit["temperature"] = "neutral"
            else:
                audit["temperature"] = str(audit["temperature"])

            # Force integer for clarity_score
            try:
                audit["clarity_score"] = int(audit.get("clarity_score", 85))
            except (ValueError, TypeError):
                audit["clarity_score"] = 85
            
            # Force pro_tip string
            audit["pro_tip"] = str(audit.get("pro_tip", "Maintain high quality lighting."))
            
            data["aesthetic_audit"] = audit
            return data
        except Exception as e:
            logger.error(f"Vision analysis failed: {e}")
            # BETTER FALLBACK: More descriptive so the generator doesn't hallucinate a gender swap
            return {
                "vibe_description": "Professional studio portrait with clean aesthetic",
                "detected_context": "A professional man in a focused, high-engagement shot",
                "suggested_tone": "Confident",
                "aesthetic_audit": {
                    "brightness": 1.1, "contrast": 1.1, "saturation": 1.0,
                    "temperature": "warm", "clarity_score": 90,
                    "pro_tip": "Maintain subject identity. Focus on sharp facial features and professional background depth."
                }
            }

    @staticmethod
    async def enhance_image(image_base64: str, audit_results: dict, user_prompt: str = "") -> dict:
        """
        Takes an existing image and uses the audit results to generate a 'Master' version.
        """
        # Construct a prompt based on the audit
        pro_tip = audit_results.get("aesthetic_audit", {}).get("pro_tip", "")
        vibe = audit_results.get("vibe_description", "")
        context = audit_results.get("detected_context", "")
        
        # Create a prompt that respects the user's initial idea + the audit results
        base_subject = user_prompt if user_prompt and len(user_prompt) > 5 else context
        
        # High fidelity enhancement prompt
        enhancement_prompt = (
            f"Professional high-quality master commercial edit of {base_subject}. "
            f"Style: {vibe}. {pro_tip}. "
            f"Cinematic lighting, 8k resolution, photorealistic, sharp focus, magazine quality shot."
        )
        
        result = await MediaService.generate_enhanced_image(enhancement_prompt)
        return {
            "enhanced_image_url": result["image_url"],
            "enhancement_prompt": enhancement_prompt
        }
