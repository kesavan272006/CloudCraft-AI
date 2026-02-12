
import asyncio
import os
import sys

# Add src to path
sys.path.append(os.path.join(os.getcwd(), 'src'))

from src.services.oracle_service import OracleService
from src.utils.logger import get_logger

logger = get_logger(__name__)

def test_oracle():
    print("Testing Oracle Service...")
    
    sample_text = """
Stop using ChatGPT for coding. 🛑

I just found a workflow that destroys the "Junior Dev" role forever.

It’s not an LLM. It’s a "Reasoning Loop" that fixes its own bugs before you even see them.
I built a full SaaS in 47 minutes. No breakpoints. No StackOverflow.

Here is the exact prompt chain I used directly in VS Code... 🧵👇
#Coding #AI #DevCommunity #TechTrends
    """
    
    try:
        print("Calling predict_performance...")
        # predict_performance is synchronous, so we call it directly
        result = OracleService.predict_performance(sample_text)
        print("Success!")
        print(f"Viral Score: {result.viral_score}")
        print(f"Confidence: {result.confidence_level}")
        print(f"Report: {result.analysis_report}")
        
    except Exception as e:
        print(f"FAILED with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_oracle()
