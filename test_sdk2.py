import os
import dashscope
from dotenv import load_dotenv

load_dotenv()
dashscope.api_key = os.environ.get("DASHSCOPE_API_KEY")
dashscope.base_http_api_url = "https://dashscope-intl.aliyuncs.com/api/v1"

result = dashscope.audio.tts.SpeechSynthesizer.call(
    model='cosyvoice-v1',
    text='Hello world',
    sample_rate=48000
)
print(result.code, result.message)
