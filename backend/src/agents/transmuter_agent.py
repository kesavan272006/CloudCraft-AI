from .base_agent import BaseAgent
from typing import Any

class TransmuterAgent(BaseAgent):
    name = "Transmuter"
    description = "Transforms content across different formats and regional languages."

    role_prompt = """
You are the Transmuter Agent - expert in adapting content across platforms and languages.

YOUR TASK:
Transform the provided content according to the specified TARGET FORMAT and TARGET LANGUAGE.

LANGUAGE RULES:
- English → Standard English
- Hindi → Devanagari script (हिंदी में)
- Hinglish → Roman script + Hindi words
- Tamil/Malayalam/Kannada/Telugu/Bengali/Marathi → Native scripts
- CRITICAL: Use ONLY the target language specified. Do NOT keep the input language.

PLATFORM FORMATTING:
- Twitter/X Thread: Hook + 3-5 numbered tweets (1/, 2/, 3/)
- Instagram Reel: Hook + Main content + CTA, with emojis and hashtags
- LinkedIn: Professional story/stat hook + 3-5 paragraphs + CTA
- Blog Post: Headline + intro + sections + conclusion (500-800 words)

CULTURAL ADAPTATION:
- Use local metaphors and cultural references
- Transcreate (adapt meaning), don't just translate word-for-word
- Respect regional preferences and sensitivities

OUTPUT FORMAT (STRICT JSON):
{
    "transformed_content": "[Complete adapted content in target language and format]",
    "format_notes": "[Platform-specific tips]",
    "regional_nuance": "[Cultural adaptations made]",
    "suggested_tags": ["#Tag1", "#Tag2", "#Tag3"],
    "estimated_reading_time": "[e.g., 30 sec]"
}

CRITICAL INSTRUCTIONS:
1. Transform the ACTUAL INPUT CONTENT provided to you
2. DO NOT invent new topics or examples
3. KEEP THE SAME SUBJECT MATTER as the input
4. Output ONLY valid JSON, no extra text
"""

    def __init__(self, **kwargs):
        # Use default LLM (Nova Lite) with anti-repetition safeguards
        super().__init__(**kwargs)
    
    async def async_run(self, task: str, context=None, history=None):
        """Override to use single-message prompt with embedded content"""
        from langchain_core.messages import HumanMessage
        import json
        import re
        
        # Construct full prompt with strong anti-repetition instructions
        full_prompt = f"""{self.role_prompt}

{task}

CRITICAL OUTPUT RULES:
1. Output ONLY valid JSON - no markdown, no extra text
2. Ensure all strings are properly escaped (use \\n for newlines)
3. DO NOT repeat words or phrases
4. Keep content natural and flowing
5. Maximum 500 characters for transformed_content
"""
        
        try:
            response = await self.llm.ainvoke([HumanMessage(content=full_prompt)])
            raw_output = response.content.strip()
            
            # Check for repetition (common issue with multilingual content)
            if self._detect_repetition(raw_output):
                from ..utils.logger import get_logger
                logger = get_logger(__name__)
                logger.warning("Detected repetition in output, attempting cleanup...")
                
                # Return graceful error JSON
                raw_output = json.dumps({
                    "transformed_content": "Content transformation encountered a repetition issue. Please try again with shorter content or a different language.",
                    "format_notes": "Repetition detected - model may not support this language well",
                    "regional_nuance": "N/A",
                    "suggested_tags": [],
                    "estimated_reading_time": "30 sec"
                })
            else:
                # Validate and extract JSON
                json_match = re.search(r'\{.*\}', raw_output, re.DOTALL)
                if json_match:
                    raw_output = json_match.group(0)
                    # Test parse to ensure it's valid
                    try:
                        json.loads(raw_output)
                    except json.JSONDecodeError:
                        # If JSON is malformed, return error JSON
                        raw_output = json.dumps({
                            "transformed_content": "Translation service encountered an error. Please try again with shorter content.",
                            "format_notes": "JSON parsing failed",
                            "regional_nuance": "N/A",
                            "suggested_tags": [],
                            "estimated_reading_time": "30 sec"
                        })
            
            return type('AgentResponse', (), {
                'thought': 'Performed content transformation',
                'output': raw_output,
                'confidence': 0.85,
                'needs_more_info': False
            })()
            
        except Exception as e:
            from ..utils.logger import get_logger
            logger = get_logger(__name__)
            logger.error(f"Transmuter failed: {str(e)}")
            return type('AgentResponse', (), {
                'thought': f'Error: {str(e)}',
                'output': json.dumps({
                    "transformed_content": "Service temporarily unavailable. Please try again.",
                    "format_notes": str(e),
                    "regional_nuance": "N/A",
                    "suggested_tags": [],
                    "estimated_reading_time": "30 sec"
                }),
                'confidence': 0.0,
                'needs_more_info': True
            })()
    
    def _detect_repetition(self, text: str, window=10, threshold=5) -> bool:
        """Detect if text has repetitive patterns (sign of model loop)"""
        if len(text) < window * threshold:
            return False
        
        # Check for repeated sequences
        for i in range(len(text) - window * threshold):
            pattern = text[i:i+window]
            count = text.count(pattern)
            if count >= threshold:
                return True
        return False
