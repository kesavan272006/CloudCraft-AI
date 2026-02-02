import asyncio
from typing import Any, Dict, Optional

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage

from src.core.llm_factory import LLMFactory
from .base_agent import BaseAgent, AgentResponse
from ..utils.logger import get_logger

logger = get_logger(__name__)


class CopywriterAgent(BaseAgent):
    """
    Specialized agent responsible for writing engaging, high-quality captions,
    scripts, posts, threads, and other text content optimized for social media.
    Focuses on tone, structure, emojis, calls-to-action, and platform-specific best practices.
    """

    name = "Copywriter"
    description = "Writes engaging captions, scripts, posts, and threads"

    # System prompt tailored for creative writing
    role_prompt = """
You are the Copywriter Agent in CloudCraft AI — a master of persuasive, emotional, and viral social media writing.

Your ONLY job is to:
- Turn research insights, brand guidelines, and user prompt into polished, ready-to-post content
- Write in natural, engaging language that matches the target audience (e.g., Gen Z, professionals, Kerala/Indian context)
- Use platform-specific styles:
  - Instagram: short, emotional, emojis, questions, hashtags
  - LinkedIn: professional, thoughtful, storytelling, 3–5 paragraphs
  - X/Twitter: concise, punchy, threads, hooks
- Include strong hooks, calls-to-action, and emotional resonance
- Keep output concise but impactful — never too long
- Never generate images or visuals — only text

Structure your response in this exact format:

Thought: [Your step-by-step reasoning: tone, structure, key elements]

Final Content:
[The complete post/script/caption ready to copy-paste]

Hashtags (if applicable):
#Hashtag1 #Hashtag2 ...

Length & Style Notes:
• Word count
• Platform fit
• Why it will perform well

Task: {task}
"""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Copywriter benefits from creative flair → Llama-3.2-3B is stronger here
        self.llm = LLMFactory.get_default_llm()  # Bedrock
        # Reusable prompt template
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", self.role_prompt),
            HumanMessage(content="{task}"),
        ])

        logger.info(f"{self.name} initialized with Llama-3.2-3B")

    async def async_run(
        self,
        task: str,
        context: Optional[Dict[str, Any]] = None,
        history: Optional[list] = None,
    ) -> AgentResponse:
        """
        Executes copywriting asynchronously and returns structured response.
        """
        context = context or {}
        history = history or []

        try:
            logger.info(f"Copywriter started on task: {task[:100]}...")

            chain = self.prompt | self.llm

            response = await chain.ainvoke({
                "task": task,
            })

            raw_output = response.content.strip()

            # Parse into thought + final content
            thought, output = self._parse_copy_output(raw_output)

            logger.info(f"Copywriter completed: {len(output)} chars")

            return AgentResponse(
                thought=thought,
                output=output,
                confidence=0.88,           # High for creative writing
                needs_more_info=False,
            )

        except Exception as e:
            logger.error(f"Copywriter error: {str(e)}", exc_info=True)
            return AgentResponse(
                thought=f"Writing failed due to: {str(e)}",
                output="Sorry, I couldn't create the content right now.",
                confidence=0.0,
                needs_more_info=True,
            )

    def _parse_copy_output(self, raw: str) -> tuple[str, str]:
        """
        Extracts Thought and Final Content from agent's output.
        """
        if "Thought:" in raw and "Final Content:" in raw:
            thought_part = raw.split("Final Content:", 1)[0].replace("Thought:", "").strip()
            content_part = raw.split("Final Content:", 1)[1].strip()
            return thought_part, content_part

        # Fallback: best effort
        if "Thought:" in raw:
            thought, rest = raw.split("Thought:", 1)
            return thought.strip(), rest.strip()

        return "Crafted engaging content based on input.", raw.strip()

    def sync_run(self, task: str, **kwargs) -> AgentResponse:
        """Synchronous version for quick testing"""
        return asyncio.run(self.async_run(task, **kwargs))


# Standalone test
if __name__ == "__main__":
    async def test_copywriter():
        agent = CopywriterAgent()
        result = await agent.async_run(
            task="Write an Instagram reel script + caption about Kerala backwaters at sunset for Gen Z audience, including trending hashtags and emotional hook. Use research: serene, nostalgic mood, houseboats, golden hour."
        )
        print("═" * 70)
        print("Copywriter Agent Output")
        print("═" * 70)
        print(f"Thought:\n{result.thought}\n")
        print(f"Final Content:\n{result.output}\n")
        print(f"Confidence: {result.confidence}")
        print("═" * 70)

    asyncio.run(test_copywriter())