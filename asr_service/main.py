"""
AyahQuest ASR sidecar service.

Wraps faster-whisper (a CTranslate2-backed reimplementation of OpenAI Whisper)
as an HTTP microservice so the Node API can request Arabic transcriptions of
recited ayat.

No model files need to be bundled — faster-whisper downloads the chosen
Whisper checkpoint from Hugging Face on first boot and caches it under
~/.cache/huggingface/.

Endpoints
---------
GET  /health                     → service status, model load status
POST /transcribe   (multipart)   → upload WAV/WebM/OGG/MP4 audio → Arabic text

Audio is decoded with ffmpeg (subprocess) + soundfile, so there is no
dependency on `audioop` or `pyaudioop`, which were removed from / never
added to Python 3.13.

HTTP shapes are **unchanged** — the Node service and frontend contract are
unaffected by this migration.
"""

import io
import os
import logging
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("asr")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Whisper model size. "medium" gives a good accuracy/speed tradeoff for
# Arabic Quran recitation on CPU.
# Choices: tiny, base, small, medium, large-v2, large-v3
# Override with the ASR_MODEL_SIZE env var.
MODEL_SIZE = os.getenv("ASR_MODEL_SIZE", "medium")

# Device: "cpu" (default, works everywhere) or "cuda" (NVIDIA GPU).
DEVICE = os.getenv("ASR_DEVICE", "cpu")

# CTranslate2 compute type.
# On CPU:  "int8" is fastest; "float32" is most precise.
# On CUDA: "float16" is best.
COMPUTE_TYPE = os.getenv("ASR_COMPUTE_TYPE", "int8")

# Whisper transcribes at 16 kHz internally.
SAMPLE_RATE = 16000

_model = None


# ---------------------------------------------------------------------------
# Audio helpers  (pydub-free, audioop-free)
# ---------------------------------------------------------------------------

def _decode_to_wav(raw_bytes: bytes, out_path: str) -> float:
    """
    Use ffmpeg directly (subprocess) to decode any browser audio format
    (WebM/Opus, OGG/Opus, MP4/AAC, WAV, …) to a 16 kHz / mono / 16-bit WAV.

    Returns the duration in seconds.  Raises RuntimeError on failure.
    This approach has zero Python audio-library dependencies beyond ffmpeg
    being on PATH, so it works on Python 3.13+ without audioop/pyaudioop.
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".input") as tmp_in:
        tmp_in.write(raw_bytes)
        tmp_in_path = tmp_in.name

    try:
        result = subprocess.run(
            [
                "ffmpeg", "-y",
                "-i", tmp_in_path,
                "-ar", str(SAMPLE_RATE),   # resample to 16 kHz
                "-ac", "1",                # mono
                "-c:a", "pcm_s16le",       # 16-bit signed PCM
                out_path,
            ],
            capture_output=True,
            timeout=120,
        )
        if result.returncode != 0:
            raise RuntimeError(result.stderr.decode(errors="replace"))
    finally:
        Path(tmp_in_path).unlink(missing_ok=True)

    # Read the WAV just to get the duration; soundfile doesn't need audioop.
    info = sf.info(out_path)
    return info.duration


# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------

def load_model():
    """
    Lazy-load the faster-whisper model.

    The first call downloads the checkpoint from Hugging Face (~1.5 GB for
    'medium') and caches it in ~/.cache/huggingface/. Subsequent boots reuse
    the cache instantly.

    When the model is unavailable /transcribe returns 503 and the Node server
    falls back to the Web Speech API path — same behaviour as before.
    """
    global _model
    if _model is not None:
        return _model

    try:
        from faster_whisper import WhisperModel  # type: ignore
    except ImportError as e:
        log.error("faster-whisper package not importable: %s", e)
        return None

    log.info(
        "Loading faster-whisper model '%s' on %s (compute_type=%s) …",
        MODEL_SIZE, DEVICE, COMPUTE_TYPE,
    )
    try:
        _model = WhisperModel(MODEL_SIZE, device=DEVICE, compute_type=COMPUTE_TYPE)
        log.info("Model ready.")
    except Exception as e:
        log.error("Failed to load model: %s", e)
        return None

    return _model


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AyahQuest ASR",
    description="faster-whisper Arabic Quran transcription sidecar",
    version="2.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup():
    # Warm up the model so the first request doesn't pay the load cost.
    load_model()


# ---------------------------------------------------------------------------
# Schemas  (unchanged from v1 — frontend contract preserved)
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_path: str   # reports model size identifier
    sample_rate: int


class TranscribeResponse(BaseModel):
    transcript: str
    sample_rate: int
    duration_sec: float


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health", response_model=HealthResponse)
def health():
    m = load_model()
    return HealthResponse(
        status="ok",
        model_loaded=m is not None,
        model_path=f"faster-whisper/{MODEL_SIZE}",
        sample_rate=SAMPLE_RATE,
    )


@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(audio: UploadFile = File(...)):
    """
    Transcribe an uploaded audio file to Arabic Quran text.

    Accepts any container ffmpeg understands (webm, ogg, mp4, wav…).
    ffmpeg resamples to 16 kHz / mono / 16-bit WAV before inference.
    """
    m = load_model()
    if m is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "ASR model not loaded. "
                "Check that faster-whisper is installed and the model downloaded."
            ),
        )

    raw = await audio.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty audio upload")

    # Decode with ffmpeg → normalised WAV temp file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_wav:
        tmp_wav_path = tmp_wav.name

    try:
        try:
            duration = _decode_to_wav(raw, tmp_wav_path)
        except FileNotFoundError:
            raise HTTPException(
                status_code=500,
                detail="ffmpeg not found. Install it: brew install ffmpeg",
            )
        except RuntimeError as e:
            log.error("ffmpeg decode failed: %s", e)
            raise HTTPException(status_code=400, detail=f"Could not decode audio: {e}")

        if duration > 60:
            raise HTTPException(status_code=413, detail="Audio too long (max 60s)")

        log.info("Transcribing %.2fs of audio …", duration)

        try:
            segments, _info = m.transcribe(
                tmp_wav_path,
                language="ar",            # Arabic — skip language-detection overhead
                task="transcribe",
                beam_size=5,
                best_of=5,
                vad_filter=True,          # suppress non-speech regions automatically
                vad_parameters=dict(
                    min_silence_duration_ms=300,
                ),
            )
            transcript = " ".join(s.text.strip() for s in segments).strip()
        except Exception as e:
            log.exception("transcription failed")
            raise HTTPException(status_code=500, detail=f"Transcription error: {e}")

    finally:
        Path(tmp_wav_path).unlink(missing_ok=True)

    log.info("→ %r", transcript)

    return TranscribeResponse(
        transcript=transcript,
        sample_rate=SAMPLE_RATE,
        duration_sec=duration,
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "5005"))
    uvicorn.run(app, host="0.0.0.0", port=port)
