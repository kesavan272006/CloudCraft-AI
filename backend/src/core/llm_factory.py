import os
from typing import Optional, Literal
from dotenv import load_dotenv

from langchain_core.language_models import BaseLanguageModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEndpoint
from langchain_aws import ChatBedrock

from ..utils.logger import get_logger

load_dotenv()

logger = get_logger(__name__)

# ────────────────────────────────────────────────
# Configuration – change these values if needed
# ────────────────────────────────────────────────

# Default priority order: Bedrock > Gemini > HuggingFace
DEFAULT_MODEL_PROVIDER: Literal["bedrock", "gemini", "huggingface"] = "bedrock"

# Hugging Face model (free inference API)
HF_MODEL_ID = "meta-llama/Llama-3.2-3B-Instruct"
HF_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

# Gemini (free tier via Google AI Studio)
GEMINI_MODEL = "gemini-1.5-flash"  # or "gemini-1.5-pro" if you have access
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

# AWS Bedrock (Claude-3-Sonnet is excellent)
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
BEDROCK_MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-sonnet-20240229-v1:0")

# Shared parameters
DEFAULT_TEMPERATURE = 0.7
DEFAULT_MAX_TOKENS = 1024

# ────────────────────────────────────────────────


class LLMFactory:
    """
    Central factory to get LLM instances.
    Priority: Bedrock (Claude) > Gemini > HuggingFace
    """

    @staticmethod
    def get_llm(
        provider: Optional[Literal["bedrock", "gemini", "huggingface"]] = None,
        temperature: float = DEFAULT_TEMPERATURE,
        max_tokens: int = DEFAULT_MAX_TOKENS,
        model_id: Optional[str] = None,
    ) -> BaseLanguageModel:
        """
        Returns a configured LangChain LLM instance.
        Falls back gracefully if primary provider fails.
        """
        provider = provider or DEFAULT_MODEL_PROVIDER

        try:
            if provider == "bedrock":
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

            elif provider == "gemini":
                if not GEMINI_API_KEY:
                    raise ValueError("GEMINI_API_KEY (or GOOGLE_API_KEY) not found in .env")

                logger.info(f"Using Gemini model: {GEMINI_MODEL}")

                return ChatGoogleGenerativeAI(
                    model=GEMINI_MODEL,
                    google_api_key=GEMINI_API_KEY,
                    temperature=temperature,
                    max_output_tokens=max_tokens,
                    convert_system_message_to_human=True,
                )

            elif provider == "huggingface":
                if not HF_TOKEN:
                    raise ValueError("HUGGINGFACEHUB_API_TOKEN not found in .env")

                logger.info(f"Using HuggingFace model: {model_id or HF_MODEL_ID}")

                return HuggingFaceEndpoint(
                    repo_id=model_id or HF_MODEL_ID,
                    huggingfacehub_api_token=HF_TOKEN,
                    temperature=temperature,
                    max_new_tokens=max_tokens,
                    task="conversational",  # Required for Llama-3.2-Instruct
                    repetition_penalty=1.2,
                    huggingfacehub_repo_type="model",
                    top_p=0.9,
                )

            else:
                raise ValueError(f"Unknown provider: {provider}")

        except Exception as e:
            logger.error(f"Failed to initialize {provider} LLM: {str(e)}")

            # Smart fallback chain: Bedrock → Gemini → HuggingFace
            fallback_order = ["bedrock", "gemini", "huggingface"]
            current_index = fallback_order.index(provider) if provider in fallback_order else 0

            for next_provider in fallback_order[current_index + 1 :]:
                logger.warning(f"Falling back to {next_provider}")
                try:
                    return LLMFactory.get_llm(
                        provider=next_provider,
                        temperature=temperature,
                        max_tokens=max_tokens,
                    )
                except Exception as fb_e:
                    logger.error(f"Fallback to {next_provider} also failed: {str(fb_e)}")

            raise RuntimeError("All LLM providers failed. Check API keys, credentials, and network.")

    @staticmethod
    def get_default_llm() -> BaseLanguageModel:
        """Quick shortcut – uses highest priority provider (Bedrock)"""
        return LLMFactory.get_llm()


# Quick test / debug
if __name__ == "__main__":
    import asyncio

    async def test_llms():
        llm_bedrock = LLMFactory.get_llm(provider="bedrock")
        llm_gemini = LLMFactory.get_llm(provider="gemini")
        llm_hf = LLMFactory.get_llm(provider="huggingface")

        prompt = "Say hello in Malayalam and explain why Kerala is beautiful in one sentence."

        print("Testing Bedrock (Claude-3-Sonnet):")
        try:
            response_bedrock = await llm_bedrock.ainvoke(prompt)
            print(response_bedrock.content.strip())
        except Exception as e:
            print(f"Bedrock Error: {e}")
        print("-" * 60)

        print("Testing Gemini Flash:")
        try:
            response_gemini = await llm_gemini.ainvoke(prompt)
            print(response_gemini.content.strip())
        except Exception as e:
            print(f"Gemini Error: {e}")
        print("-" * 60)

        print("Testing HuggingFace (Llama-3.2-3B):")
        try:
            response_hf = await llm_hf.ainvoke(prompt)
            print(response_hf.content.strip())
        except Exception as e:
            print(f"HF Error: {e}")

    asyncio.run(test_llms())