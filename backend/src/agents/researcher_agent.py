import asyncio
from typing import Any, Dict, Optional

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage

from src.core.llm_factory import LLMFactory
from .base_agent import BaseAgent, AgentResponse
from ..utils.logger import get_logger

logger = get_logger(__name__)


class ResearcherAgent(BaseAgent):
    """
    Specialized agent that gathers facts, trends, background information, and insights.
    Acts as the "research" step in the content creation pipeline.
    """

    name = "Researcher"
    description = "Gathers facts, trends, background info, and web insights"

    # System prompt specific to Researcher
    role_prompt = """
You are the Researcher Agent in CloudCraft AI.
Your role is to provide accurate, relevant background information, trends, statistics, 
and insights to support content creation.

Rules:
- Be factual and concise — do NOT invent information.
- Focus on recent trends, cultural relevance (especially India/Kerala context when applicable).
- If the task involves current events or viral content, mention approximate sources or patterns.
- Summarize clearly in 3–6 bullet points or short paragraphs.
- End with key takeaways that the Copywriter or Designer can use.

Task: {task}
"""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Researcher benefits from fast reasoning → Gemini Flash
        self.llm = LLMFactory.get_default_llm()  # Bedrock

        # Build prompt template once
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", self.role_prompt),
            HumanMessage(content="{task}"),
        ])

    async def async_run(
        self,
        task: str,
        context: Optional[Dict[str, Any]] = None,
        history: Optional[list] = None,
    ) -> AgentResponse:
        """
        Main async execution for Researcher.
        Returns structured AgentResponse.
        """
        context = context or {}
        history = history or []

        try:
            logger.info(f"Researcher processing task: {task[:80]}...")

            chain = self.prompt | self.llm

            response = await chain.ainvoke({
                "task": task,
            })

            raw_output = response.content.strip()

            # Simple parsing: first part as thought, rest as output
            thought, output = self._parse_research_output(raw_output)

            return AgentResponse(
                thought=thought,
                output=output,
                confidence=0.90,  # Researcher is usually confident in facts
                needs_more_info=False,
            )

        except Exception as e:
            logger.error(f"Researcher failed: {str(e)}")
            return AgentResponse(
                thought=f"Error during research: {str(e)}",
                output="Unable to gather information due to an internal error.",
                confidence=0.0,
                needs_more_info=True,
            )

    def _parse_research_output(self, raw: str) -> tuple[str, str]:
        """
        Simple heuristic parser:
        - First paragraph/block = thought/reasoning
        - Rest = actual research output
        """
        lines = raw.split("\n\n", 1)  # Split on double newline
        if len(lines) >= 2:
            thought = lines[0].strip()
            output = lines[1].strip()
        else:
            thought = "Researched and summarized key points."
            output = raw.strip()

        return thought, output

    def sync_run(self, task: str, **kwargs) -> AgentResponse:
        """Synchronous wrapper for quick testing"""
        return asyncio.run(self.async_run(task, **kwargs))


# Quick standalone test (run file directly)
if __name__ == "__main__":
    async def test_researcher():
        agent = ResearcherAgent()
        result = await agent.async_run(
            task="Research current trends in Kerala tourism for Gen Z audience in 2025"
        )
        print(f"Thought: {result.thought}")
        print(f"Output:\n{result.output}")
        print(f"Confidence: {result.confidence}")

    asyncio.run(test_researcher())