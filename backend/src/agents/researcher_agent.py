import asyncio
from typing import Any, Dict, Optional
import os
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage
from tavily import TavilyClient

from src.core.llm_factory import LLMFactory
from .base_agent import BaseAgent, AgentResponse
from ..utils.logger import get_logger

logger = get_logger(__name__)

# Load Tavily API key from .env (your key from playground)
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


class ResearcherAgent(BaseAgent):
    """
    Specialized agent that gathers facts, trends, background info, and real-time web insights.
    Automatically uses Tavily search/extract/crawl when needed for accuracy.
    """

    name = "Researcher"
    description = "Gathers facts, trends, background info, and real-time web insights"

    # Updated prompt: medium length, full meaning, no clipping, smart tool use
    role_prompt = """
You are an expert Research Agent.
Your role is to provide accurate, relevant, up-to-date background information, trends, statistics, and insights.

Rules:
- Always be factual — automatically use web search, extract, or crawl if info is recent, uncertain, or needs specific sources.
- Answer concisely yet completely: aim for 100–250 words max, use bullet points or short paragraphs.
- Never cut answers short, say "not enough", or clip — always give full useful answer in medium length.
- Focus on recent trends, cultural relevance (especially India/Kerala context when applicable).
- Summarize clearly with key takeaways for Copywriter/Designer.
- If using tools, mention sources briefly (e.g., "Recent reports show...").

Task: {task}
"""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Use default LLM (Bedrock preferred)
        self.llm = LLMFactory.get_default_llm()

        # Prompt template
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", self.role_prompt),
            HumanMessage(content="{task}"),
        ])

        logger.info(f"{self.name} initialized with real-time Tavily tools enabled")

    async def async_run(
        self,
        task: str,
        context: Optional[Dict[str, Any]] = None,
        history: Optional[list] = None,
    ) -> AgentResponse:
        """
        Main async execution — automatically decides and uses Tavily tools.
        """
        context = context or {}
        history = history or []

        try:
            logger.info(f"Researcher processing task: {task[:80]}...")

            search_results = ""
            extract_results = ""
            crawl_results = ""

            # Auto-decide tool use
            task_lower = task.lower()
            if any(word in task_lower for word in ["current", "recent", "trend", "now", "latest", "today", "2025"]):
                logger.info("Performing web search...")
                try:
                    response = tavily_client.search(query=task, search_depth="advanced")
                    search_results = "\n".join([r.get("content", "")[:300] for r in response.get("results", [])])
                except Exception as e:
                    logger.warning(f"Search failed: {str(e)}")

            if "site:" in task or "url:" in task or "extract from" in task_lower or "specific page" in task_lower:
                logger.info("Performing extract...")
                urls = [word for word in task.split() if word.startswith("http")]
                if urls:
                    try:
                        extract_results = tavily_client.extract(urls=urls)
                    except Exception as e:
                        logger.warning(f"Extract failed: {str(e)}")

            if "crawl" in task_lower or "deep" in task_lower or "full site" in task_lower:
                logger.info("Performing crawl...")
                url = next((word for word in task.split() if word.startswith("http")), None)
                if url:
                    try:
                        crawl_results = tavily_client.crawl(url=url, extract_depth="advanced")
                    except Exception as e:
                        logger.warning(f"Crawl failed: {str(e)}")

            # Combine tool results
            tool_output = ""
            if search_results:
                tool_output += f"Web search results:\n{search_results}\n\n"
            if extract_results:
                tool_output += f"Extracted content:\n{extract_results}\n\n"
            if crawl_results:
                tool_output += f"Crawled data:\n{crawl_results}\n\n"

            # Build full input
            full_task = f"{task}\n\nTool results (if any):\n{tool_output}"
            
            # DEBUG: Log the exact task being sent to LLM
            logger.info(f"[DEBUG] Full task being sent to Researcher LLM:\n{full_task[:500]}")

            chain = self.prompt | self.llm

            response = await chain.ainvoke({
                "task": full_task,
            })

            raw_output = response.content.strip()

            # Parse
            thought, output = self._parse_research_output(raw_output)

            return AgentResponse(
                thought=thought,
                output=output,
                confidence=0.94,  # Higher with tools
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
        Simple parser: first part = thought, rest = research output
        """
        lines = raw.split("\n\n", 1)
        if len(lines) >= 2:
            thought = lines[0].strip()
            output = lines[1].strip()
        else:
            thought = "Researched and summarized key points."
            output = raw.strip()

        return thought, output

    def sync_run(self, task: str, **kwargs) -> AgentResponse:
        return asyncio.run(self.async_run(task, **kwargs))


# Quick standalone test
if __name__ == "__main__":
    async def test_researcher():
        agent = ResearcherAgent()
        result = await agent.async_run(
            task="Current trends in Kerala tourism for Gen Z audience in 2025"
        )
        print(f"Thought: {result.thought}")
        print(f"Output:\n{result.output}")
        print(f"Confidence: {result.confidence}")

    asyncio.run(test_researcher())