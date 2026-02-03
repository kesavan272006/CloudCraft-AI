import os
from typing import Optional, Literal
from dotenv import load_dotenv

from langchain_core.language_models import BaseLanguageModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEndpoint
from langchain_aws import ChatBedrock
from langchain_openai import ChatOpenAI # Required for OpenRouter
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.tools import Tool

from ..utils.logger import get_logger

load_dotenv()

logger = get_logger(__name__)

# ────────────────────────────────────────────────
# Configuration
# ────────────────────────────────────────────────

# Default priority: Bedrock (Claude) > Gemini > HuggingFace > OpenRouter
DEFAULT_MODEL_PROVIDER: Literal["bedrock", "gemini", "huggingface", "openrouter"] = "bedrock"

# Hugging Face model
HF_MODEL_ID = "meta-llama/Llama-3.2-3B-Instruct"
HF_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

# Gemini
GEMINI_MODEL = "gemini-1.5-flash"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

# AWS Bedrock
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
BEDROCK_MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-sonnet-20240229-v1:0")

# OpenRouter / Nemotron (New)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
NEMOTRON_MODEL = "nvidia/nemotron-3-nano-30b-a3b:free"

# Tavily API
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

# Shared parameters
DEFAULT_TEMPERATURE = 0.7
DEFAULT_MAX_TOKENS = 1024

# ────────────────────────────────────────────────

# Shared Tavily tool
tavily_search = TavilySearchResults(max_results=5) if TAVILY_API_KEY else None

class LLMFactory:
    """
    Central factory to get LLM instances + shared tools.
    """

    @staticmethod
    def get_llm(
        provider: Optional[Literal["bedrock", "gemini", "huggingface", "openrouter"]] = None,
        temperature: float = DEFAULT_TEMPERATURE,
        max_tokens: int = DEFAULT_MAX_TOKENS,
        model_id: Optional[str] = None,
    ) -> BaseLanguageModel:
        provider = provider or DEFAULT_MODEL_PROVIDER

        try:
            # --- OpenRouter (Nemotron) ---
            if provider == "openrouter":
                if not OPENROUTER_API_KEY:
                    raise ValueError("OPENROUTER_API_KEY not found in .env")
                
                logger.info(f"Using OpenRouter model: {model_id or NEMOTRON_MODEL}")
                return ChatOpenAI(
                    model=model_id or NEMOTRON_MODEL,
                    api_key=OPENROUTER_API_KEY,
                    base_url="https://openrouter.ai/api/v1",
                    temperature=temperature,
                    max_tokens=max_tokens,
                    default_headers={
                        "HTTP-Referer": "http://localhost:5173", # Update with your production URL later
                        "X-Title": "CloudCraft AI"
                    }
                )

            # --- AWS Bedrock ---
            elif provider == "bedrock":
                if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
                    raise ValueError("AWS credentials not found in .env")

                logger.info(f"Using Bedrock model: {model_id or BEDROCK_MODEL_ID}")
                return ChatBedrock(
                    model_id=model_id or BEDROCK_MODEL_ID,
                    aws_access_key_id=AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                    region_name=AWS_REGION,
                    model_kwargs={
                        "temperature": temperature,
                        "max_tokens": max_tokens,
                    },
                )

            # --- Gemini ---
            elif provider == "gemini":
                if not GEMINI_API_KEY:
                    raise ValueError("GEMINI_API_KEY not found in .env")

                logger.info(f"Using Gemini model: {GEMINI_MODEL}")
                return ChatGoogleGenerativeAI(
                    model=GEMINI_MODEL,
                    google_api_key=GEMINI_API_KEY,
                    temperature=temperature,
                    max_output_tokens=max_tokens,
                    convert_system_message_to_human=True,
                )

            # --- HuggingFace ---
            elif provider == "huggingface":
                if not HF_TOKEN:
                    raise ValueError("HUGGINGFACEHUB_API_TOKEN not found in .env")

                logger.info(f"Using HuggingFace model: {model_id or HF_MODEL_ID}")
                return HuggingFaceEndpoint(
                    repo_id=model_id or HF_MODEL_ID,
                    huggingfacehub_api_token=HF_TOKEN,
                    temperature=temperature,
                    max_new_tokens=max_tokens,
                    task="conversational",
                )

            else:
                raise ValueError(f"Unknown provider: {provider}")

        except Exception as e:
            logger.error(f"Failed to initialize {provider} LLM: {str(e)}", exc_info=True)
            # Fallback chain
            fallback_order = ["bedrock", "gemini", "openrouter"]
            current_index = fallback_order.index(provider) if provider in fallback_order else 0

            for next_provider in fallback_order[current_index + 1 :]:
                try:
                    return LLMFactory.get_llm(provider=next_provider)
                except:
                    continue
            
            raise RuntimeError("All LLM providers failed.")

    @staticmethod
    def get_default_llm() -> BaseLanguageModel:
        return LLMFactory.get_llm()

    @staticmethod
    def get_tools():
        tools = []
        if tavily_search:
            tools.append(
                Tool(
                    name="web_search",
                    func=tavily_search.invoke,
                    description="Search the web for current information, trends, and facts."
                )
            )
        return tools