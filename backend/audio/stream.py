import subprocess
import whisper
import tempfile
import os
import asyncio
from models import TranscriptChunk

print("Loading Whisper model...")
whisper_model = whisper.load_model("base")
print("Whisper ready")

# Resolve yt-dlp from venv or PATH
_HERE = os.path.dirname(os.path.abspath(__file__))
_YT_DLP = os.path.join(_HERE, "..", "venv", "bin", "yt-dlp")
if not os.path.exists(_YT_DLP):
    _YT_DLP = "yt-dlp"


def get_audio_stream_url(youtube_url: str) -> str:
    result = subprocess.run(
        [_YT_DLP, "-f", "bestaudio", "--get-url", youtube_url],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise Exception(f"yt-dlp failed: {result.stderr}")
    stream_url = result.stdout.strip()
    print(f"Got stream URL: {stream_url[:80]}...")
    return stream_url


def download_audio_chunk(stream_url: str, start_seconds: int, duration: int = 30) -> str:
    tmp_file = tempfile.mktemp(suffix=".wav")
    result = subprocess.run([
        "ffmpeg",
        "-ss", str(start_seconds),
        "-i", stream_url,
        "-t", str(duration),
        "-ar", "16000",
        "-ac", "1",
        "-f", "wav",
        tmp_file,
        "-y",
        "-loglevel", "error",
    ], capture_output=True, text=True)
    if result.returncode != 0:
        raise Exception(f"ffmpeg failed: {result.stderr}")
    return tmp_file


def transcribe_chunk(audio_path: str) -> str:
    result = whisper_model.transcribe(audio_path, fp16=False)
    return result["text"].strip()


def format_timestamp(seconds: int) -> str:
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    return f"{h:02d}:{m:02d}:{s:02d}"


async def stream_transcript(youtube_url: str, company_ticker: str, chunk_callback):
    print(f"Starting stream for {youtube_url}")

    loop = asyncio.get_event_loop()
    stream_url = await loop.run_in_executor(None, get_audio_stream_url, youtube_url)

    current_second = 0
    chunk_duration = 30

    while True:
        print(f"Processing chunk at {format_timestamp(current_second)}...")

        try:
            audio_path = await loop.run_in_executor(
                None, download_audio_chunk, stream_url, current_second, chunk_duration
            )
        except Exception as e:
            print(f"Chunk download failed at {current_second}s: {e}")
            break

        text = await loop.run_in_executor(None, transcribe_chunk, audio_path)
        os.remove(audio_path)

        if text:
            chunk = TranscriptChunk(
                speaker="Unknown",
                text=text,
                timestamp=format_timestamp(current_second),
                company_ticker=company_ticker.upper(),
            )
            await chunk_callback(chunk)

        current_second += chunk_duration
        await asyncio.sleep(0.5)
