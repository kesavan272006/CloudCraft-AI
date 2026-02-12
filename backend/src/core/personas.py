"""
Audience Persona Definitions for Content Personalization
"""

PERSONAS = {
    "gen_z": {
        "name": "Gen-Z (18-24)",
        "description": "Young, digital-native, trend-conscious",
        "age_range": "18-24",
        "language_style": "hinglish_casual",
        "tone": "playful, trendy, relatable",
        "platforms": ["instagram", "tiktok", "snapchat"],
        "emoji_usage": "high",
        "slang": True,
        "formality": "very_casual",
        "cultural_refs": ["memes", "trending_audio", "viral_challenges"],
        "prompt_modifier": """
        Write for Gen-Z audience (18-24 years):
        - Use Hinglish (mix of Hindi and English)
        - Keep it casual, fun, and trendy
        - Use emojis liberally (3-5 per post)
        - Include popular slang (yaar, bro, vibe, flex, etc.)
        - Reference current trends and memes
        - Short, punchy sentences
        - FOMO-driven CTAs
        """
    },
    
    "professional": {
        "name": "Working Professional (25-35)",
        "description": "Career-focused, value-driven, time-conscious",
        "age_range": "25-35",
        "language_style": "formal_english",
        "tone": "professional, insightful, value-driven",
        "platforms": ["linkedin", "twitter"],
        "emoji_usage": "minimal",
        "slang": False,
        "formality": "formal",
        "cultural_refs": ["industry_trends", "productivity", "career_growth"],
        "prompt_modifier": """
        Write for Working Professionals (25-35 years):
        - Use formal, professional English
        - Focus on value proposition and ROI
        - Data-driven and credible tone
        - Minimal emojis (0-2, professional ones only)
        - Industry-relevant terminology
        - Clear, structured messaging
        - Action-oriented CTAs
        """
    },
    
    "parent": {
        "name": "Parents (30-50)",
        "description": "Family-focused, health-conscious, practical",
        "age_range": "30-50",
        "language_style": "simple_english",
        "tone": "caring, informative, trustworthy",
        "platforms": ["facebook", "whatsapp"],
        "emoji_usage": "moderate",
        "slang": False,
        "formality": "semi_formal",
        "cultural_refs": ["family_values", "health", "safety", "education"],
        "prompt_modifier": """
        Write for Parents (30-50 years):
        - Use simple, clear English
        - Focus on family benefits and safety
        - Caring and trustworthy tone
        - Moderate emoji use (2-3, family-friendly)
        - Emphasize health, quality, and value
        - Relatable family scenarios
        - Reassuring CTAs
        """
    },
    
    "regional_tamil": {
        "name": "Tamil Audience",
        "description": "Tamil-speaking, culturally rooted, regional pride",
        "age_range": "18-45",
        "language_style": "tamil_english_mix",
        "tone": "local, relatable, proud",
        "platforms": ["instagram", "whatsapp", "facebook"],
        "emoji_usage": "moderate",
        "slang": True,
        "formality": "casual",
        "cultural_refs": ["tamil_culture", "chennai", "local_festivals"],
        "prompt_modifier": """
        Write for Tamil-speaking audience:
        - Mix Tamil and English naturally (Tanglish)
        - Use Tamil words for emphasis (anna, thala, semma, etc.)
        - Reference Chennai/Tamil Nadu culture
        - Local pride and relatability
        - Moderate emoji use (2-4)
        - Conversational, friendly tone
        - Community-focused messaging
        """
    },
    
    "entrepreneur": {
        "name": "Entrepreneurs & Founders (25-40)",
        "description": "Visionary, growth-minded, innovation-focused",
        "age_range": "25-40",
        "language_style": "concise_impactful",
        "tone": "bold, visionary, inspiring",
        "platforms": ["twitter", "linkedin"],
        "emoji_usage": "minimal",
        "slang": False,
        "formality": "semi_formal",
        "cultural_refs": ["innovation", "disruption", "scaling", "impact"],
        "prompt_modifier": """
        Write for Entrepreneurs and Founders (25-40 years):
        - Concise, impactful language
        - Bold and visionary tone
        - Focus on innovation and growth
        - Minimal emojis (0-2, impactful ones)
        - Action-oriented and inspiring
        - Data and results-driven
        - Challenge conventional thinking
        """
    }
}

def get_persona(persona_id: str) -> dict:
    """Get persona configuration by ID"""
    return PERSONAS.get(persona_id, PERSONAS["professional"])

def get_all_personas() -> dict:
    """Get all available personas"""
    return PERSONAS

def get_persona_prompt_modifier(persona_id: str) -> str:
    """Get the prompt modifier for a specific persona"""
    persona = get_persona(persona_id)
    return persona.get("prompt_modifier", "")
