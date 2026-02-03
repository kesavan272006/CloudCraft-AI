import asyncio
import os
import sys
# Add src to path
sys.path.append(os.getcwd())

# Force load dotenv
from dotenv import load_dotenv
load_dotenv()

from src.services.brand_service import BrandService

async def test_connection():
    print("--- DEBUGGING DYNAMODB CONNECTION ---")
    print(f"Current Working Directory: {os.getcwd()}")
    print(f"AWS_REGION: {os.getenv('AWS_REGION')}")
    print(f"AWS_ACCESS_KEY_ID: {os.getenv('AWS_ACCESS_KEY_ID')}")
    
    try:
        print("Attempting to load brand profile...")
        profile = await BrandService.load_brand_profile()
        print("SUCCESS! Profile loaded:", profile)
    except Exception as e:
        print("CONNECTION FAILED!")
        print(f"Error Type: {type(e)}")
        print(f"Error Message: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_connection())
