"""
Sarvam AI Service — handles TTS, translation, and STT API calls.
All calls are wrapped in try/except to ensure the app doesn't break if the API is down.
"""

import os
import base64
import httpx
from typing import Optional

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")
SARVAM_BASE = "https://api.sarvam.ai"
MAX_TTS_CHARS = 480  # keep under 500 limit with safety margin


def _headers_json() -> dict:
    return {
        "api-subscription-key": SARVAM_API_KEY,
        "Content-Type": "application/json",
    }


def _headers_key_only() -> dict:
    return {
        "api-subscription-key": SARVAM_API_KEY,
    }


def _split_text_into_chunks(text: str, max_len: int = MAX_TTS_CHARS) -> list[str]:
    """Split text at sentence boundaries ('. ') keeping chunks under max_len."""
    if len(text) <= max_len:
        return [text]

    sentences = text.split(". ")
    chunks: list[str] = []
    current = ""

    for sentence in sentences:
        candidate = f"{current}. {sentence}" if current else sentence
        if len(candidate) <= max_len:
            current = candidate
        else:
            if current:
                chunks.append(current.strip())
            current = sentence

    if current:
        chunks.append(current.strip())

    return chunks if chunks else [text[:max_len]]


def _combine_wav_base64(audio_chunks: list[str]) -> str:
    """
    Combine multiple base64 WAV audio chunks into one.
    Keep WAV header (44 bytes) from first chunk, append raw PCM data from the rest.
    Then re-encode combined audio back to base64.
    """
    if len(audio_chunks) == 1:
        return audio_chunks[0]

    combined = b""
    for i, chunk_b64 in enumerate(audio_chunks):
        raw = base64.b64decode(chunk_b64)
        if i == 0:
            combined += raw  # keep full WAV (header + data)
        else:
            combined += raw[44:]  # skip WAV header, just raw PCM

    # Update the WAV header sizes
    total_size = len(combined)
    data_size = total_size - 44

    # Update RIFF chunk size (bytes 4-7): total_size - 8
    combined = bytearray(combined)
    riff_size = total_size - 8
    combined[4:8] = riff_size.to_bytes(4, byteorder='little')
    # Update data chunk size (bytes 40-43)
    combined[40:44] = data_size.to_bytes(4, byteorder='little')

    return base64.b64encode(bytes(combined)).decode("utf-8")


async def text_to_speech(
    text: str,
    language: str = "hi-IN",
    speaker: str = "anushka",
) -> Optional[str]:
    """
    Convert text to speech using Sarvam AI TTS.
    Handles chunking for long text (>480 chars).
    Returns base64-encoded WAV audio, or None on failure.
    """
    try:
        chunks = _split_text_into_chunks(text)
        audio_parts: list[str] = []

        async with httpx.AsyncClient(timeout=30.0) as client:
            for chunk in chunks:
                resp = await client.post(
                    f"{SARVAM_BASE}/text-to-speech",
                    headers=_headers_json(),
                    json={
                        "inputs": [chunk],
                        "target_language_code": language,
                        "speaker": speaker,
                        "pace": 1.0,
                        "pitch": 0,
                        "loudness": 1.5,
                        "speech_sample_rate": 22050,
                        "enable_preprocessing": True,
                        "model": "bulbul:v2",
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                if data.get("audios"):
                    audio_parts.append(data["audios"][0])

        if not audio_parts:
            return None

        return _combine_wav_base64(audio_parts)

    except Exception as e:
        print(f"[Sarvam TTS Error] {e}")
        return None


async def translate_text(
    text: str,
    source_lang: str = "en-IN",
    target_lang: str = "hi-IN",
) -> Optional[str]:
    """
    Translate text using Sarvam AI Translate API.
    Returns translated text, or None on failure.
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{SARVAM_BASE}/translate",
                headers=_headers_json(),
                json={
                    "input": text,
                    "source_language_code": source_lang,
                    "target_language_code": target_lang,
                    "speaker_gender": "Female",
                    "mode": "formal",
                    "model": "mayura:v1",
                    "enable_preprocessing": True,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("translated_text")

    except Exception as e:
        print(f"[Sarvam Translate Error] {e}")
        return None


async def speech_to_text(
    audio_bytes: bytes,
    filename: str = "recording.wav",
    language: str = "hi-IN",
) -> Optional[str]:
    """
    Transcribe audio using Sarvam AI STT.
    Returns transcript text, or None on failure.
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{SARVAM_BASE}/speech-to-text",
                headers=_headers_key_only(),
                files={"file": (filename, audio_bytes, "audio/wav")},
                data={
                    "language_code": language,
                    "model": "saarika:v2",
                    "with_timestamps": "false",
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("transcript")

    except Exception as e:
        print(f"[Sarvam STT Error] {e}")
        return None
