import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get("DASHSCOPE_API_KEY") or os.environ.get("QWEN_API_KEY")
print(f"Key loaded: {bool(api_key)}")

resp = requests.post(
    "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2audio/generation",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "X-DashScope-DataInspection": "enable"
    },
    json={
        "model": "cosyvoice-v3-plus",
        "input": {"text": "Hello, this is a test of the Qwen CosyVoice API."},
        "parameters": {"voice": "longxiaochun", "format": "mp3"}
    }
)

if resp.status_code == 200:
    with open("test.mp3", "wb") as f:
        f.write(resp.content)
    print("Success! Saved test.mp3")
else:
    print(f"Error: {resp.status_code} - {resp.text}")
