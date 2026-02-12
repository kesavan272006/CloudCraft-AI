
import sys
import json
import urllib.request
import urllib.error

# 1. Check if we can import the agent (Syntax check)
try:
    print("Checking TransmuterAgent syntax...")
    sys.path.append("c:\\Users\\tharu\\hackathons\\CloudCraft AI\\CloudCraft-AI-1\\backend")
    from src.agents.transmuter_agent import TransmuterAgent
    print("✅ TransmuterAgent import successful.")
except Exception as e:
    print(f"❌ TransmuterAgent import failed: {e}")
    sys.exit(1)

# 2. Check if we can hit the API
url = "http://127.0.0.1:8000/api/v1/transmute"
data = {
    "content": "Our new coffee machine is amazing. It uses AI to brew perfect coffee.",
    "target_format": "Twitter Thread",
    "target_language": "Hinglish",
    "tone_modifier": "Excited"
}
headers = {'Content-Type': 'application/json'}

print(f"\nSending request to {url}...")
try:
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)
    with urllib.request.urlopen(req) as response:
        result = response.read().decode('utf-8')
        print("✅ API Response:")
        print(result)
except urllib.error.HTTPError as e:
    print(f"❌ HTTP Error {e.code}: {e.reason}")
    print(e.read().decode('utf-8'))
except urllib.error.URLError as e:
    print(f"❌ Connection Error: {e.reason}")
    print("Backend likely not running or port blocked.")
except Exception as e:
    print(f"❌ Unexpected Error: {e}")
