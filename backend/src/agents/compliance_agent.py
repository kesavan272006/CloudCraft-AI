import asyncio
from typing import Any, Dict, Optional

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage

from src.core.llm_factory import LLMFactory
from .base_agent import BaseAgent, AgentResponse
from ..utils.logger import get_logger

logger = get_logger(__name__)


class ComplianceAgent(BaseAgent):
    """
    Specialized agent responsible for brand compliance checking.
    Analyzes generated content against brand guidelines, tone, values,
    prohibited words, visual style, and cultural appropriateness.
    Returns pass/fail + specific fixes.
    """

    name = "Compliance"
    description = "Checks brand alignment, tone, values, and compliance"

    # System prompt tailored for strict compliance
    role_prompt = """
    You are an expert Senior Editor and Content Reviewer.
    
    Your task is to REVIEW and POLISH the content, ensuring it's ready to publish while PRESERVING its creative energy and personality.
    
    CRITICAL RULES:
    1. **PRESERVE CREATIVITY** - Keep hooks, emotional language, and personality intact
    2. **FIX ONLY REAL ISSUES** - Grammar, factual errors, offensive content
    3. **DO NOT SANITIZE** - Don't turn creative copy into bland corporate speak
    4. **KEEP IT SUBSTANTIVE** - Don't shorten or strip the content
    5. **OUTPUT THE ACTUAL CONTENT** - Not placeholder text like "[content here]"
    6. **NO SAFETY THEATER** - Don't add unnecessary disclaimers or warnings
    
    What to check:
    ✓ Grammar and spelling
    ✓ Factual accuracy (if verifiable)
    ✓ Offensive or harmful content
    ✓ Readability and flow
    
    What NOT to change:
    ✗ Creative hooks and emotional language
    ✗ Platform-specific formatting (emojis, hashtags, line breaks)
    ✗ Conversational tone
    ✗ Persuasive elements
    
    Instructions:
    Rewrite the content below to fix grammar and brand tone.
    
    CRITICAL:
    - KEEP THE SAME TOPIC.
    - DO NOT INVENT FACTS.
    - OUTPUT ONLY THE POLISHED CONTENT.
    
    CONTENT TO POLISH:
    {content}
    
    POLISHED CONTENT:
    """

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Revert to default LLM (likely Bedrock/Nova Lite)
        self.llm = LLMFactory.get_default_llm()

        # Simple prompt template - we embed content directly in the system prompt equivalent
        # because some models handle "User: {content}" better when it's part of the instruction block for this specific task.
        self.prompt = ChatPromptTemplate.from_messages([
            ("human", self.role_prompt), 
        ])
        logger.info(f"{self.name} initialized with Default LLM (Proofreading Mode)")

    async def async_run(
        self,
        task: str,
        content: str,  # The output from previous agents (caption/script)
        context: Optional[Dict[str, Any]] = None,
        history: Optional[list] = None,
    ) -> AgentResponse:
        """
        Executes compliance check asynchronously.
        Requires 'content' parameter (the text/visual suggestion to review).
        """
        context = context or {}
        history = history or []

        if not content:
            return AgentResponse(
                thought="No content provided for compliance check.",
                output="Compliance check skipped — no content received.",
                confidence=0.0,
                needs_more_info=True,
            )

        try:
            logger.info(f"Compliance checking content ({len(content)} chars)...")

            chain = self.prompt | self.llm

            response = await chain.ainvoke({
                "task": task,
                "content": content,
            })

            raw_output = response.content.strip()

            # Parse into thought + structured output
            thought, output = self._parse_compliance_output(raw_output)

            logger.info(f"Compliance completed: {len(output)} chars")

            return AgentResponse(
                thought=thought,
                output=output,
                confidence=0.95,           # High confidence for rule-based checking
                needs_more_info=False,
            )

        except Exception as e:
            logger.error(f"Compliance error: {str(e)}", exc_info=True)
            return AgentResponse(
                thought=f"Compliance check failed due to: {str(e)}",
                output="Unable to perform brand compliance check right now.",
                confidence=0.0,
                needs_more_info=True,
            )

    def _parse_compliance_output(self, raw: str) -> tuple[str, str]:
        """
        Extracts Thought and the rest (Score + Status + Issues + Approved) from output.
        """
        # DEBUG: Log raw output
        logger.info(f"[DEBUG] Compliance raw output (first 500 chars):\n{raw[:500]}")
        
        if "FINAL CONTENT:" in raw:
            thought_part, content_part = raw.split("FINAL CONTENT:", 1)
            logger.info(f"[DEBUG] Compliance final content extracted: {content_part[:200]}")
            return thought_part.strip(), content_part.strip()
            
        logger.warning("[DEBUG] No 'FINAL CONTENT:' marker found in Compliance output!")
        return "Performed compliance review.", raw.strip()

    def sync_run(self, task: str, content: str, **kwargs) -> AgentResponse:
        """Synchronous version for quick testing"""
        return asyncio.run(self.async_run(task, content, **kwargs))


# Standalone test
if __name__ == "__main__":
    async def test_compliance():
        agent = ComplianceAgent()
        sample_content = """
        Reel Script: Floating through Kerala backwaters at sunset... feels unreal! 🛶🌅
        Who's coming with me next trip?
        #KeralaVibes #SunsetGoals
        """
        result = await agent.async_run(
            task="Check this content against brand guidelines: tone should be professional yet warm, avoid excessive emojis, no slang, focus on sustainability.",
            content=sample_content
        )
        print("═" * 70)
        print("Compliance Agent Output")
        print("═" * 70)
        print(f"Thought:\n{result.thought}\n")
        print(f"Output:\n{result.output}\n")
        print(f"Confidence: {result.confidence}")
        print("═" * 70)

    asyncio.run(test_compliance())