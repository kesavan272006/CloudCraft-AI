
import requests
import json

def test_api():
    url = "http://localhost:8000/api/v1/oracle/predict"
    payload = {
        "content": "Test content for viral prediction."
    }
    
    print(f"Sending POST to {url}...")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print("Response Body:")
        print(response.text)
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_api()
