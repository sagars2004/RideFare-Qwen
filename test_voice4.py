import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("DASHSCOPE_API_KEY") or os.environ.get("QWEN_API_KEY")

resp = requests.post(
    "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2audio/text2audio",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable"
    },
    json={
        "model": "cosyvoice-v1",
        "input": {"text": "Hello, welcome to the Qwen Cloud Hackathon!"},
        "parameters": {"voice": "default"}
    }
)
print("cosyvoice-v1", resp.status_code, resp.text)

resp = requests.post(
    "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2audio/text2audio",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable"
    },
    json={
        "model": "cosyvoice-v3-plus",
        "input": {"text": "Hello, welcome to the Qwen Cloud Hackathon!"},
        "parameters": {"voice": "default"}
    }
)
print("cosyvoice-v3-plus", resp.status_code, resp.text)
