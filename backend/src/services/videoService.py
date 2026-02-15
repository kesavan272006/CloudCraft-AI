import os
import time
import jwt
import requests
import uuid
from dotenv import load_dotenv
from src.core.llm_factory import LLMFactory
from src.utils.logger import get_logger

# Initialize environment and logging
load_dotenv()
logger = get_logger(__name__)

class VideoService:
    def __init__(self):
        # Your new Kling Credentials
        self.access_key = os.getenv("KLING_ACCESS_KEY")
        self.secret_key = os.getenv("KLING_SECRET_KEY")
        self.base_url = "https://api.klingai.com/v1"
        
        # Local storage for served videos
        self.output_dir = "static/videos"
        os.makedirs(self.output_dir, exist_ok=True)

    def _generate_jwt(self):
        """Generates the required JWT token for Kling AI API calls."""
        headers = {"alg": "HS256", "typ": "JWT"}
        payload = {
            "iss": self.access_key,
            "exp": int(time.time()) + 1800,  # Token valid for 30 minutes
            "nbf": int(time.time()) - 5      # Valid immediately
        }
        # Note: Ensure you have 'PyJWT' installed (pip install PyJWT)
        return jwt.encode(payload, self.secret_key, headers=headers)

    async def refine_prompt(self, user_input, is_image_to_video=False):
        """Uses CloudCraft's LLMFactory to enhance the prompt for video dynamics."""
        llm = LLMFactory.get_llm(provider="openrouter")
        
        # Tailoring the expansion specifically for Kling's high-fidelity engine
        expansion_prompt = f"""
        Expand this idea into a high-end, cinematic video prompt for Kling AI. 
        Focus on fluid motion, volumetric lighting, and realistic textures.
        Idea: {user_input}
        
        Return ONLY the expanded prompt text.
        """
        
        try:
            logger.info(f"🧠 Expanding prompt via LLMFactory (OpenRouter)...")
            expanded_res = await llm.ainvoke(expansion_prompt)
            return expanded_res.content.strip()
        except Exception as e:
            logger.error(f"⚠️ Prompt refinement failed: {e}")
            return user_input

    async def generate_video(self, user_input, image_url=None):
        """The main entry point for video generation."""
        # 1. Expand the user's prompt
        final_prompt = await self.refine_prompt(user_input, is_image_to_video=bool(image_url))
        
        # 2. Get a fresh Auth Token
        token = self._generate_jwt()
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
        # 3. Prepare the Kling Payload (Standard 5s generation)
        payload = {
            "model": "kling-v1",
            "prompt": final_prompt,
            "duration": "5", 
            "mode": "std"    # 'std' uses fewer credits than 'pro'
        }
        
        if image_url:
            payload["image_url"] = image_url

        try:
            logger.info(f"🎬 Submitting Kling AI task...")
            response = requests.post(
                f"{self.base_url}/videos/text2video", 
                headers=headers, 
                json=payload
            )
            response.raise_for_status()
            
            task_id = response.json().get("data", {}).get("task_id")
            logger.info(f"✅ Video Task Created: {task_id}")
            
            # 4. Poll until the video is ready
            return await self._poll_for_video(task_id, token, final_prompt)
            
        except Exception as e:
            logger.error(f"❌ Kling API Failure: {str(e)}")
            return {"error": f"Kling API Error: {str(e)}"}

    async def _poll_for_video(self, task_id, token, final_prompt):
        """Check status until video is finished or fails."""
        status_url = f"{self.base_url}/videos/text2video/{task_id}"
        headers = {"Authorization": f"Bearer {token}"}
        
        # Max wait time of ~5 minutes
        for attempt in range(60):
            try:
                res = requests.get(status_url, headers=headers).json()
                data = res.get("data", {})
                status = data.get("task_status")

                if status == "completed":
                    video_url = data.get("video_resource", {}).get("url")
                    logger.info("✅ Kling generation finished!")
                    return {
                        "video_url": video_url,
                        "refined_prompt": final_prompt,
                        "status": "completed"
                    }
                elif status == "failed":
                    error_msg = data.get("task_status_msg", "Unknown error")
                    return {"error": f"Kling Task Failed: {error_msg}"}
                
                logger.info(f"⏳ Status: {status} (Attempt {attempt+1})...")
                time.sleep(5)
                
            except Exception as e:
                logger.error(f"⚠️ Polling error: {e}")
                time.sleep(5)
                
        return {"error": "Kling generation timed out."}