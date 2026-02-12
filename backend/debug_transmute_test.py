import asyncio
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from agents.transmuter_agent import TransmuterAgent

async def test_transmute():
    agent = TransmuterAgent()
    
    content = """🚲✨ This has changed everything for urban mobility in Kerala! ✨🚲

We just showcased the Amrita Bicycle Rental System at the Anokha Tech Fair, and it's a game-changer! 🌟

🔍 Smart locks & GPS tracking make renting a breeze.
💻 Built on a robust MERN stack for real-time updates.
🌱 Promoting eco-friendly transport in bustling cities.

What do you think about this innovation? 🚴♂️💬

#SmartBike #UrbanMobility #TechFair #SustainableLiving #Kerala"""
    
    task = f"""
ORIGINAL CONTENT:
{content}

TARGET FORMAT: Instagram Reel
TARGET LANGUAGE: Tamil
TONE: Keep original tone

Transform this content according to the requested format and language.
If it's an Indian language, ensure it sounds native and authentic.
"""
    
    print("Testing Transmute Agent...")
    print("=" * 80)
    
    response = await agent.async_run(task=task)
    
    print("\n📝 RAW OUTPUT:")
    print("-" * 80)
    print(response.output)
    print("-" * 80)
    
    print("\n✅ Output length:", len(response.output))
    print("✅ First 200 chars:", response.output[:200])

if __name__ == "__main__":
    asyncio.run(test_transmute())
