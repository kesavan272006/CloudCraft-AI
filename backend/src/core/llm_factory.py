import os
from typing import Optional, Literal
from dotenv import load_dotenv

from langchain_core.language_models import BaseLanguageModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEndpoint

from ..utils.logger import get_logger  # We'll create logger.py later

load_dotenv(dotenv_path=r"D:\Cloud_craft_AI\backend\.env")

logger = get_logger(__name__)

# ────────────────────────────────────────────────
# Configuration – change these values if needed
# ────────────────────────────────────────────────

DEFAULT_MODEL_PROVIDER: Literal["huggingface", "gemini"] = "huggingface"

# Hugging Face model (free inference API)
HF_MODEL_ID = "meta-llama/Llama-3.2-3B-Instruct"
HF_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

# Gemini (free tier via Google AI Studio)
GEMINI_MODEL = "gemini-2.5-flash"  # or "gemini-2.5-pro" if you have access
# Read either GEMINI_API_KEY or fall back to GOOGLE_API_KEY for compatibility
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

# Shared parameters
DEFAULT_TEMPERATURE = 0.7
DEFAULT_MAX_TOKENS = 1024

# ────────────────────────────────────────────────


class LLMFactory:
    """
    Central factory to get LLM instances.
    Only supports Hugging Face (Llama-3.2-3B) and Gemini.

    Usage example:
        llm = LLMFactory.get_llm(provider="huggingface", temperature=0.8)
        llm = LLMFactory.get_default_llm()
    """

    @staticmethod
    def get_llm(
        provider: Optional[Literal["huggingface", "gemini"]] = None,
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

                # Use the conversational task for models that expect chat-style input
                return HuggingFaceEndpoint(
                    repo_id=model_id or HF_MODEL_ID,
                    huggingfacehub_api_token=HF_TOKEN,
                    temperature=temperature,
                    max_new_tokens=max_tokens,
                    task="conversational",
                    repetition_penalty=1.2,           # Helps avoid repetitive text
                    huggingfacehub_repo_type="model",
                    top_p=0.9,                        # Nucleus sampling
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
                    convert_system_message_to_human=True,  # Better handling of system prompts
                )

            else:
                raise ValueError(f"Unknown provider: {provider}")

        except Exception as e:
            logger.error(f"Failed to initialize {provider} LLM: {str(e)}")

            # Fallback logic (only between the two allowed providers)
            if provider == "huggingface":
                logger.warning("Falling back to Gemini Flash")
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

            else:
                raise RuntimeError("Both LLM providers failed. Check API keys and network.")

    @staticmethod
    def get_default_llm() -> BaseLanguageModel:
        """Quick shortcut for most agents – uses default provider (Llama via HF)"""
        return LLMFactory.get_llm()


# For quick testing / debugging
if __name__ == "__main__":
    import asyncio

    async def test_llms():
        llm_hf = LLMFactory.get_llm(provider="huggingface")
        llm_gemini = LLMFactory.get_llm(provider="gemini")

        prompt = "Say hello in Malayalam and explain why Kerala is beautiful in one sentence."

        print("Testing HuggingFace (Llama-3.2-3B):")
        response_hf = llm_hf.invoke(prompt)
        print(response_hf.content.strip())
        print("-" * 50)

        print("Testing Gemini Flash:")
        response_gemini = llm_gemini.invoke(prompt)
        print(response_gemini.content.strip())

    asyncio.run(test_llms())