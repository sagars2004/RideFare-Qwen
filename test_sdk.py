import os
import dashscope
from dotenv import load_dotenv

load_dotenv()
dashscope.api_key = os.environ.get("DASHSCOPE_API_KEY")
dashscope.base_http_api_url = "https://dashscope-intl.aliyuncs.com/api/v1"

try:
    result = dashscope.audio.tts.SpeechSynthesizer.call(
        model='cosyvoice-v1',
        text='Hello world',
        sample_rate=48000
    )
    if result.get_audio_data() is not None:
        with open('output.mp3', 'wb') as f:
            f.write(result.get_audio_data())
        print("Success! Saved output.mp3")
    else:
        print("Error:", result)
except Exception as e:
    print("Exception:", e)
