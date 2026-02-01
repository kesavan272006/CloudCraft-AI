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

DEFAULT_MODEL_PROVIDER: Literal["huggingface", "gemini", "bedrock"] = "bedrock"

# Hugging Face model (free inference API)
HF_MODEL_ID = "meta-llama/Llama-3.2-3B-Instruct"
HF_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

# Gemini (free tier via Google AI Studio)
GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

# AWS Bedrock
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
    Supports Hugging Face, Gemini, and AWS Bedrock.
    """

    @staticmethod
    def get_llm(
        provider: Optional[Literal["huggingface", "gemini", "bedrock"]] = None,
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
            if provider == "huggingface":
                if not HF_TOKEN:
                    raise ValueError("HUGGINGFACEHUB_API_TOKEN not found in .env")

                logger.info(f"Using HuggingFace model: {model_id or HF_MODEL_ID}")

                return HuggingFaceEndpoint(
                    repo_id=model_id or HF_MODEL_ID,
                    huggingfacehub_api_token=HF_TOKEN,
                    temperature=temperature,
                    max_new_tokens=max_tokens,
                    task="conversational",
                    repetition_penalty=1.2,
                    huggingfacehub_repo_type="model",
                    top_p=0.9,
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

            else:
                raise ValueError(f"Unknown provider: {provider}")

        except Exception as e:
            logger.error(f"Failed to initialize {provider} LLM: {str(e)}")

            # Fallback logic
            if provider == "bedrock":
                logger.warning("Falling back to Gemini")
                return LLMFactory.get_llm(
                    provider="gemini",
                    temperature=temperature,
                    max_tokens=max_tokens,
                )

            elif provider == "gemini":
                logger.warning("Falling back to HuggingFace Llama-3.2")
                return LLMFactory.get_llm(
                    provider="huggingface",
                    temperature=temperature,
                    max_tokens=max_tokens,
                )

            elif provider == "huggingface":
                logger.warning("Falling back to Bedrock")
                return LLMFactory.get_llm(
                    provider="bedrock",
                    temperature=temperature,
                    max_tokens=max_tokens,
                )

            else:
                raise RuntimeError("All LLM providers failed. Check API keys and network.")

    @staticmethod
    def get_default_llm() -> BaseLanguageModel:
        """Quick shortcut for most agents – uses default provider"""
        return LLMFactory.get_llm()


# For quick testing / debugging
if __name__ == "__main__":
    import asyncio

    async def test_llms():
        llm_hf = LLMFactory.get_llm(provider="huggingface")
        llm_gemini = LLMFactory.get_llm(provider="gemini")
        llm_bedrock = LLMFactory.get_llm(provider="bedrock")

        prompt = "Say hello in Malayalam and explain why Kerala is beautiful in one sentence."

        print("Testing HuggingFace (Llama-3.2-3B):")
        try:
            response_hf = llm_hf.invoke(prompt)
            print(response_hf.content.strip())
        except Exception as e:
            print(f"HF Error: {e}")
        print("-" * 50)

        print("Testing Gemini Flash:")
        try:
            response_gemini = llm_gemini.invoke(prompt)
            print(response_gemini.content.strip())
        except Exception as e:
            print(f"Gemini Error: {e}")
        print("-" * 50)

        print("Testing Bedrock Claude:")
        try:
            response_bedrock = llm_bedrock.invoke(prompt)
            print(response_bedrock.content.strip())
        except Exception as e:
            print(f"Bedrock Error: {e}")

    asyncio.run(test_llms())