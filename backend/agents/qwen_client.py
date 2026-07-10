import os
import json
import requests
from typing import Any, Dict

def get_qwen_api_key():
    return os.environ.get("QWEN_API_KEY") or os.environ.get("DASHSCOPE_API_KEY")

def call_qwen_json(prompt: str, system_prompt: str = "You are a helpful assistant.", model: str = "qwen-plus") -> Dict[str, Any]:
    api_key = get_qwen_api_key()
    if not api_key:
        raise ValueError("QWEN_API_KEY environment variable is not set.")
        
    url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "response_format": {"type": "json_object"}
    }
    
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code != 200:
        raise RuntimeError(f"Qwen API error: {response.text}")
        
    data = response.json()
    content = data["choices"][0]["message"]["content"]
    
    # Strip any markdown fences if they still exist despite json_object format
    content = content.strip()
    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
        
    return json.loads(content.strip())
