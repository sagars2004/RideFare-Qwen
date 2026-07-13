import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("DASHSCOPE_API_KEY")

resp = requests.post(
    "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2audio/generation",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    },
    json={
        "model": "cosyvoice-v3-plus",
        "input": {"text": "Hello, welcome to the Qwen Cloud Hackathon!"},
        "parameters": {"voice": "default"}
    }
)
print(resp.status_code, resp.text)
