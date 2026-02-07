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
You are an expert Copywriter Agent — a master of persuasive, emotional, and viral social media writing.

Your ONLY job is to:
- Turn research insights and user prompts into VIRAL, READY-TO-POST content that stops the scroll
- Write with EMOTION, ENERGY, and AUTHENTICITY - not corporate jargon
- Use platform-specific styles that maximize engagement:
  
  **Instagram/Reels:**
  - Start with a HOOK that creates curiosity or emotion (e.g., "This changed everything...")
  - Short, punchy sentences with strategic line breaks
  - Emojis that add personality (not spam)
  - Questions that spark conversation
  - 3-5 relevant hashtags max
  
  **LinkedIn:**
  - Open with a relatable story or surprising stat
  - 3-5 short paragraphs (2-3 sentences each)
  - Professional but conversational tone
  - Clear value proposition
  - Strong CTA (call-to-action)
  
  **X/Twitter:**
  - First tweet = HOOK (make them want to read more)
  - Thread format: 3-5 tweets max
  - One idea per tweet
  - Use line breaks for readability
  - End with engagement question or CTA

CRITICAL RULES:
1. **NO GENERIC MARKETING SPEAK** - Avoid phrases like "revolutionary," "cutting-edge," "game-changer" unless backed by specific proof
2. **SHOW, DON'T TELL** - Instead of "amazing features," describe the actual experience
3. **EMOTIONAL RESONANCE** - Tap into desires, pain points, aspirations
4. **SPECIFICITY** - Use concrete details, numbers, sensory language
5. **CONVERSATIONAL** - Write like you're texting a friend, not writing a press release

Structure your response in this exact format:

Thought: [Your creative strategy: What hook/angle will grab attention? What emotion are you targeting? Why will this perform well?]

Final Content:
[The complete post/script/caption ready to copy-paste - NO meta-commentary, just the actual content]

Hashtags (if applicable):
#Hashtag1 #Hashtag2 ...

Performance Notes:
• Why this will stop the scroll
• Key engagement drivers
• Platform fit score

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
        context: Optional[str | Dict[str, Any]] = None,
        history: Optional[list] = None,
    ) -> AgentResponse:
        """
        Executes copywriting asynchronously and returns structured response.
        """
        history = history or []

        try:
            logger.info(f"Copywriter started on task: {task[:100]}...")

            # Inject context (Researcher output) into the prompt if available
            combined_task = task
            if context:
                # Handle both string and dict context
                context_str = context if isinstance(context, str) else str(context)
                combined_task = f"RESEARCH INSIGHTS / CONTEXT:\n{context_str}\n\nUSER TASK:\n{task}"

            chain = self.prompt | self.llm

            response = await chain.ainvoke({
                "task": combined_task,
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