import asyncio
from typing import Any, Dict, Optional

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage

from src.core.llm_factory import LLMFactory
from .base_agent import BaseAgent, AgentResponse
from ..utils.logger import get_logger

logger = get_logger(__name__)


class DesignerAgent(BaseAgent):
    """
    Specialized agent responsible for visual creativity.
    Suggests image ideas, composition, color palettes, mood, editing tips,
    and generates ready-to-use prompts for image generation tools.
    """

    name = "Designer"
    description = "Suggests visuals, image ideas, style edits, and generation prompts"

    # System prompt tailored for visual design
    role_prompt = """
You are the Designer Agent in CloudCraft AI — a creative visual storyteller.

Your ONLY job is to suggest visuals and generate image prompts.

ALWAYS respond in this EXACT format (do not add extra text):

Thought: [Your step-by-step visual reasoning, 2-4 sentences]

Visual Suggestions:
• Bullet 1: Main scene / composition
• Bullet 2: Color palette & lighting
• Bullet 3: Mood & emotion
• Bullet 4: Editing recommendations

Image Prompt:
[Full, detailed prompt ready to copy-paste into FLUX or Midjourney]

Platform Notes:
• Best format (e.g., 9:16 for reels)
• Why it will grab attention

Example for task "sunset beach":
Thought: Sunset needs warm tones, silhouette focus for drama, Gen Z loves cinematic vibes.

Visual Suggestions:
• Main scene: Silhouetted palm trees against orange-pink sky
• Color palette: Deep orange, purple, golden highlights
• Mood: Dreamy, adventurous
• Editing: Boost contrast + vignette

Image Prompt: Cinematic sunset beach with silhouetted palm trees, vibrant orange and purple sky, golden hour lighting, dreamy Gen Z vibe, 9:16 vertical, high detail, cinematic

Platform Notes:
• 9:16 for Instagram Reels
• Grabs attention with emotional golden hour aesthetic

Task: {task}
"""
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Designer needs creative + visual thinking → Gemini Flash is excellent
        self.llm = LLMFactory.get_llm(
            provider="gemini",
            temperature=0.9,      # Higher temp = more creative visuals
            max_tokens=1500
        )

        # Reusable prompt template
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", self.role_prompt),
            HumanMessage(content="{task}"),
        ])

        logger.info(f"{self.name} initialized with Gemini Flash")

    async def async_run(
        self,
        task: str,
        context: Optional[Dict[str, Any]] = None,
        history: Optional[list] = None,
    ) -> AgentResponse:
        """
        Executes visual design asynchronously and returns structured response.
        """
        context = context or {}
        history = history or []

        try:
            logger.info(f"Designer started on task: {task[:100]}...")

            chain = self.prompt | self.llm

            response = await chain.ainvoke({
                "task": task,
            })

            raw_output = response.content.strip()

            # Parse into thought + structured output
            thought, output = self._parse_design_output(raw_output)

            logger.info(f"Designer completed: {len(output)} chars")

            return AgentResponse(
                thought=thought,
                output=output,
                confidence=0.85,           # Creative suggestions = slightly lower confidence
                needs_more_info=False,
            )

        except Exception as e:
            logger.error(f"Designer error: {str(e)}", exc_info=True)
            return AgentResponse(
                thought=f"Design failed due to: {str(e)}",
                output="Sorry, I couldn't create visual suggestions right now.",
                confidence=0.0,
                needs_more_info=True,
            )

    def _parse_design_output(self, raw: str) -> tuple[str, str]:
        """
        Extracts Thought and the rest (Visual Suggestions + Prompt) from agent's output.
        """
        if "Thought:" in raw and "Visual Suggestions:" in raw:
            thought_part = raw.split("Visual Suggestions:", 1)[0].replace("Thought:", "").strip()
            content_part = raw.split("Visual Suggestions:", 1)[1].strip()
            return thought_part, content_part

        # Fallback: best effort
        if "Thought:" in raw:
            thought, rest = raw.split("Thought:", 1)
            return thought.strip(), rest.strip()

        return "Designed visual concept based on input.", raw.strip()

    def sync_run(self, task: str, **kwargs) -> AgentResponse:
        """Synchronous version for quick testing"""
        return asyncio.run(self.async_run(task, **kwargs))


# Standalone test
if __name__ == "__main__":
    async def test_designer():
        agent = DesignerAgent()
        result = await agent.async_run(
            task="Suggest visuals and image prompt for Instagram reel about Kerala backwaters at sunset for Gen Z. Use mood: serene, nostalgic, golden hour, houseboats."
        )
        print("═" * 70)
        print("Designer Agent Output")
        print("═" * 70)
        print(f"Thought:\n{result.thought}\n")
        print(f"Output:\n{result.output}\n")
        print(f"Confidence: {result.confidence}")
        print("═" * 70)

    asyncio.run(test_designer())