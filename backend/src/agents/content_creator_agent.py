
from .base_agent import BaseAgent
from ..utils.logger import get_logger

logger = get_logger(__name__)

class ContentCreatorAgent(BaseAgent):
    """
    Creative Copywriter agent.
    Generates actual marketing content (tweets, emails, scripts) based on strategy.
    Outputs Markdown/Text, NOT JSON.
    """

    name = "ContentCreator"
    description = "Writes creative marketing copy"

    role_prompt = """
    You are a world-class Copywriter and Content Creator.
    Your goal is to write high-converting, engaging marketing content based on a provided strategy.

    Your Output Format must be CLEAN PLAIN TEXT or MARKDOWN.
    Do NOT output JSON.
    Do NOT include explanatory wrappers like "Here is the tweet:". Just write the content.
    """
