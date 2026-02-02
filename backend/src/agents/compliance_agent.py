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
You are the Compliance Agent in CloudCraft AI — a strict guardian of brand identity.

Your ONLY job is to:
- Review the final content (caption, script, visual suggestions) against brand guidelines
- Check tone, voice, key messages, prohibited words/phrases, cultural fit (especially India/Kerala context)
- Flag any violations or misalignments
- Suggest precise fixes or approve as-is
- Be detailed but fair — never rewrite the whole content, just highlight issues and corrections

Structure your response in this exact format:

Thought: [Step-by-step compliance reasoning]

Compliance Score: [0–100]

Status: [PASS / MINOR FIXES / MAJOR ISSUES]

Issues & Fixes:
• Issue 1: [description] → Fix: [exact suggestion]
• Issue 2: ...

Approved Version (if minor fixes):
[The improved content with only necessary changes]

Task: {task}
Content to check: {content}
"""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Compliance needs high precision & rule-following → Gemini Flash (strict mode)
        self.llm = LLMFactory.get_default_llm()  # Bedrock

        # Reusable prompt template
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", self.role_prompt),
            HumanMessage(content="{task}\nContent to check: {content}"),
        ])

        logger.info(f"{self.name} initialized with Gemini Flash (strict mode)")

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
        if "Thought:" in raw and "Compliance Score:" in raw:
            thought_part = raw.split("Compliance Score:", 1)[0].replace("Thought:", "").strip()
            content_part = raw.split("Compliance Score:", 1)[1].strip()
            return thought_part, content_part

        # Fallback: best effort
        if "Thought:" in raw:
            thought, rest = raw.split("Thought:", 1)
            return thought.strip(), rest.strip()

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