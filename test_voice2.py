import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("DASHSCOPE_API_KEY")

urls_to_try = [
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2audio/text2audio",
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2audio/generation",
    "https://dashscope.aliyuncs.com/api/v1/services/audio/text2audio/text2audio",
    "https://dashscope-intl.aliyuncs.com/api/v1/services/audio/text2audio/text2audio",
    "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2audio/text2audio"
]

for url in urls_to_try:
    print(f"Trying {url}...")
    resp = requests.post(
        url,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={"model": "cosyvoice-v1", "input": {"text": "test"}}
    )
    print(resp.status_code, resp.text[:100])
