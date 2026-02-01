import asyncio
from typing import Any, Dict, List, Optional, Type
from pydantic import BaseModel, Field
from langchain_core.language_models import BaseLanguageModel
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from src.core.llm_factory import LLMFactory
from ..utils.logger import get_logger

logger = get_logger(__name__)


class AgentResponse(BaseModel):
    """
    Standardized output from any agent.
    Makes it easy for Supervisor to parse and chain responses.
    """
    thought: str = Field(..., description="Agent's internal reasoning / step-by-step thought")
    output: str = Field(..., description="Final answer or result from this agent")
    confidence: float = Field(0.0, ge=0.0, le=1.0, description="Self-assessed confidence (0–1)")
    needs_more_info: bool = Field(False, description="True if agent needs additional context from Supervisor")
    tool_calls: Optional[List[Dict[str, Any]]] = None  # Future: for tool calling support


class BaseAgent:
    """
    Abstract base class for all specialized agents.
    Every agent must inherit from this and implement run() or async_run().

    Example usage in supervisor:
        agent = ResearcherAgent()
        result = await agent.async_run(task="Research Kerala tourism trends")
    """

    name: str = "BaseAgent"               # Override in child classes
    description: str = "Base agent class"  # Override in child classes
    role_prompt: str = ""                 # System prompt specific to this agent (override!)

    def __init__(
        self,
        llm: Optional[BaseLanguageModel] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ):
        self.llm = llm or LLMFactory.get_default_llm()
        self.temperature = temperature
        self.max_tokens = max_tokens

        # Build prompt template once (reusable)
        self.prompt_template = ChatPromptTemplate.from_messages([
            SystemMessage(content=self.role_prompt),
            MessagesPlaceholder(variable_name="history", optional=True),
            HumanMessage(content="{task}"),
        ])

        logger.info(f"Initialized {self.name} agent")

    async def async_run(
        self,
        task: str,
        context: Optional[Dict[str, Any]] = None,
        history: Optional[List[Any]] = None,
    ) -> AgentResponse:
        """
        Main async entry point for agents.
        Returns standardized AgentResponse.
        """
        context = context or {}
        history = history or []

        try:
            # Build full prompt with task + context + history
            full_prompt = self.prompt_template.format_messages(
                task=task,
                **context
            ) + history

            # Call LLM
            response = await self.llm.ainvoke(full_prompt)

            # Parse output (simple string split for MVP – can improve later)
            raw_output = response.content.strip()
            thought, output = self._parse_thought_and_output(raw_output)

            return AgentResponse(
                thought=thought,
                output=output,
                confidence=0.85,  # Placeholder – can be improved with self-evaluation
                needs_more_info=False,
            )

        except Exception as e:
            logger.error(f"{self.name} failed on task '{task}': {str(e)}")
            return AgentResponse(
                thought=f"Error occurred: {str(e)}",
                output="Failed to complete task due to internal error.",
                confidence=0.0,
                needs_more_info=True,
            )

    def _parse_thought_and_output(self, raw: str) -> tuple[str, str]:
        """
        Simple parser for MVP: assumes agent outputs in format:
        Thought: [reasoning]
        Output: [final result]

        Can be replaced with structured output later.
        """
        if "Thought:" in raw and "Output:" in raw:
            parts = raw.split("Output:", 1)
            thought_part = parts[0].replace("Thought:", "").strip()
            output_part = parts[1].strip()
            return thought_part, output_part

        # Fallback if no clear format
        return "No explicit thought provided.", raw

    def sync_run(self, task: str, **kwargs) -> AgentResponse:
        """Sync wrapper for testing (uses asyncio.run)"""
        return asyncio.run(self.async_run(task, **kwargs))

    def __str__(self) -> str:
        return f"{self.name} ({self.description})"


# ────────────────────────────────────────────────
# Example specialized agent (just for reference – override in real files)
# ────────────────────────────────────────────────

class ExampleResearcherAgent(BaseAgent):
    name = "Researcher"
    description = "Gathers facts, trends, and background information"
    role_prompt = """
You are a world-class researcher agent.
Your job is to find accurate, up-to-date information and insights.
Always be factual, cite sources when possible, and summarize clearly.
Never invent facts.
    """

    # You can override async_run if needed for custom tools/behavior