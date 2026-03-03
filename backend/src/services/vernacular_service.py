import json
import asyncio
from typing import Dict, Any, List
from src.core.llm_factory import LLMFactory
from src.utils.logger import get_logger
from langchain_core.messages import HumanMessage, SystemMessage

logger = get_logger(__name__)

STATE_LANGUAGE_MAP = {
    "Maharashtra": {"language": "Marathi", "dialect": "Puneri/Standard", "key_festivals": ["Ganesh Chaturthi", "Gudi Padwa"]},
    "Punjab": {"language": "Punjabi", "dialect": "Majhi", "key_festivals": ["Baisakhi", "Lohri"]},
    "Tamil Nadu": {"language": "Tamil", "dialect": "Chennai/Madurai", "key_festivals": ["Pongal", "Puthandu"]},
    "Kerala": {"language": "Malayalam", "dialect": "Standard", "key_festivals": ["Onam", "Vishu"]},
    "West Bengal": {"language": "Bengali", "dialect": "Kolkata", "key_festivals": ["Durga Puja", "Poila Baisakh"]},
    "Karnataka": {"language": "Kannada", "dialect": "Old Mysore", "key_festivals": ["Ugadi", "Mysuru Dasara"]},
    "Gujarat": {"language": "Gujarati", "dialect": "Standard", "key_festivals": ["Navratri", "Uttarayan"]},
    "Rajasthan": {"language": "Hindi", "dialect": "Marwari", "key_festivals": ["Gangaur", "Teej"]},
    "Uttar Pradesh": {"language": "Hindi", "dialect": "Awadhi/Bhojpuri", "key_festivals": ["Diwali", "Holi"]},
    "Andhra Pradesh": {"language": "Telugu", "dialect": "Standard", "key_festivals": ["Sankranti", "Ugadi"]},
    "Telangana": {"language": "Telugu", "dialect": "Hyderabadi", "key_festivals": ["Bonalu", "Bathukamma"]},
    "Assam": {"language": "Assamese", "dialect": "Standard", "key_festivals": ["Bihu"]},
    "Bihar": {"language": "Hindi", "dialect": "Maithili/Bhojpuri", "key_festivals": ["Chhath Puja"]},
    "Madhya Pradesh": {"language": "Hindi", "dialect": "Malwi/Bundeli", "key_festivals": ["Khajuraho Dance Festival"]},
    "Jammu and Kashmir": {"language": "Kashmiri", "dialect": "Pahari", "key_festivals": ["Navreh", "Eid"]},
    "Kashmir": {"language": "Kashmiri", "dialect": "Pahari", "key_festivals": ["Navreh", "Eid"]},
    "Odisha": {"language": "Odia", "dialect": "Standard", "key_festivals": ["Ratha Yatra"]},
    "Chhattisgarh": {"language": "Hindi", "dialect": "Chhattisgarhi", "key_festivals": ["Bastar Dussehra"]},
    "Uttarakhand": {"language": "Hindi", "dialect": "Garhwali/Kumaoni", "key_festivals": ["Kumbh Mela"]},
}

class VernacularService:
    def __init__(self):
        self.llm = LLMFactory.get_llm()

    async def transmute_content(self, content: str, state: str) -> Dict[str, Any]:
        """
        Agentic workflow to culturally and linguistically pivot content.
        """
        config = STATE_LANGUAGE_MAP.get(state, {"language": "Hindi", "dialect": "Standard", "key_festivals": ["General Indian"]})
        language = config["language"]
        dialect = config["dialect"]
        
        # 1. Cultural Nuance Analysis
        culture_prompt = f"""
        ACT AS: Socio-Cultural Expert for {state}, India.
        TASK: Analyze how to adapt the provided content for the local {state} audience.
        CONSIDER: 
        - Local idioms or slang (e.g., 'Ama' in Tamil Nadu or 'Sahi hai' in Mumbai).
        - Cultural sensitivities.
        - Popular local icons/festivals ({', '.join(config['key_festivals'])}).
        - Tone: Should it be respectful, energetic, or quirky for this region?
        
        CONTENT: {content}
        
        OUTPUT FORMAT (JSON):
        {{
            "cultural_nuances": ["nuance 1", "nuance 2"],
            "local_slang_to_use": ["slang 1", "slang 2"],
            "visual_direction": "describe colors/symbols (e.g., saffron/yellow for rural, neon for urban Bangalore)",
            "tone_strategy": "describe the tone"
        }}
        """
        
        # 2. Linguistic Pivot
        translation_prompt = f"""
        ACT AS: Linguistic Expert & Copywriter specializing in {language} ({dialect} dialect).
        TASK: Transcreate (not just translate) the content into {language}.
        GOAL: It must feel like it was originally written by a local for a local.
        
        CONTENT: {content}
        CONTEXT: {state} culture.
        
        OUTPUT: Just the translated text in {language} script.
        """

        try:
            # Run LLM calls
            culture_task = self.llm.ainvoke([SystemMessage(content=culture_prompt), HumanMessage(content="Give me the analysis.")])
            translation_task = self.llm.ainvoke([SystemMessage(content=translation_prompt), HumanMessage(content=content)])
            
            culture_res, trans_res = await asyncio.gather(culture_task, translation_task)
            
            # Extract JSON from culture response
            try:
                # Basic cleaning of JSON string from LLM
                clean_json = culture_res.content.replace('```json', '').replace('```', '').strip()
                culture_data = json.loads(clean_json)
            except:
                culture_data = {
                    "cultural_nuances": ["Emphasize local community values"],
                    "local_slang_to_use": [],
                    "visual_direction": "Use warm, inviting colors",
                    "tone_strategy": "Authentic and grounded"
                }

            return {
                "original_content": content,
                "translated_content": trans_res.content.strip(),
                "state": state,
                "language": language,
                "cultural_nuances": culture_data.get("cultural_nuances", []),
                "local_slang": culture_data.get("local_slang_to_use", []),
                "visual_cues": culture_data.get("visual_direction", ""),
                "tone": culture_data.get("tone_strategy", "")
            }

        except Exception as e:
            logger.error(f"Vernacular transmute error: {str(e)}")
            return {
                "error": f"Failed to transmute: {str(e)}",
                "original_content": content
            }
