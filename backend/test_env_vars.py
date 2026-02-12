import os
from dotenv import load_dotenv
load_dotenv()

def test_keys():
    keys = [
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
        "GEMINI_API_KEY",
        "HUGGINGFACEHUB_API_TOKEN",
        "TAVILY_API_KEY",
        "OPENROUTER_API_KEY",
        "POLLINATIONS_API_KEY",
        "KLING_ACCESS_KEY",
        "KLING_SECRET_KEY"
    ]
    
    for key in keys:
        val = os.getenv(key)
        if val:
            print(f"✅ {key} is set (starts with {val[:4]}...)")
        else:
            print(f"❌ {key} is MISSING!")

if __name__ == "__main__":
    test_keys()
