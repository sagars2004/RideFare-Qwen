import os
import dashscope
from dotenv import load_dotenv

load_dotenv()
dashscope.api_key = os.environ.get("DASHSCOPE_API_KEY")

try:
    # Try the default base_url without changing it to dashscope-intl
    result = dashscope.audio.tts.SpeechSynthesizer.call(
        model='sambert-zhichu-v1',
        text='Hello world',
        sample_rate=48000
    )
    print("Result object properties:", dir(result))
    if result.get_audio_data() is not None:
        with open('output.mp3', 'wb') as f:
            f.write(result.get_audio_data())
        print("Success! Saved output.mp3 using sambert-zhichu-v1")
    else:
        print("Error getting audio data.")
except Exception as e:
    print("Exception:", e)
