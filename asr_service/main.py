"""
AyahQuest ASR sidecar service.

Wraps the DeepSpeech-Quran trained model (TensorFlow Lite) as an HTTP
microservice so the Node API can request Arabic transcriptions of recited
ayat. The model and scorer are bundled in ./models/.

Endpoints
---------
GET  /health                     → service status, model load status
POST /transcribe   (multipart)   → upload WAV/WebM/OGG audio → Arabic text

The model expects 16 kHz / 16-bit / mono PCM. We accept anything the user's
browser produced (Chrome typically gives WebM/Opus, Safari gives MP4/AAC,
Firefox gives OGG/Opus) and use ffmpeg via pydub to convert to the right
format before inference.

Trained on the Imam + filtered Tarteel-users dataset by Tarek Eldeeb
(github.com/tarekeldeeb/DeepSpeech-Quran). Acoustic WER ≈ 9.9% on the
held-out Quran test set.
"""

import io
import os
import logging
import wave
from pathlib import Path

import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pydub import AudioSegment

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("asr")

# --- Model loading -----------------------------------------------------------

MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_PATH = os.getenv("ASR_MODEL", str(MODEL_DIR / "quran.tflite"))
SCORER_PATH = os.getenv("ASR_SCORER", str(MODEL_DIR / "quran.scorer"))

# DeepSpeech sample rate — DeepSpeech-Quran was trained at 16 kHz.
SAMPLE_RATE = 16000

_model = None


def load_model():
    """Lazy-load the DeepSpeech model so the service can boot even if the
    `deepspeech` package isn't installed yet (useful in dev/CI). When the
    model is unavailable, /transcribe returns 503 and Node falls back to
    the Web Speech API path."""
    global _model
    if _model is not None:
        return _model

    try:
        from deepspeech import Model  # type: ignore
    except ImportError as e:
        log.error("deepspeech package not importable: %s", e)
        return None

    if not Path(MODEL_PATH).exists():
        log.error("Acoustic model not found at %s", MODEL_PATH)
        return None
    if not Path(SCORER_PATH).exists():
        log.warning("Scorer not found at %s; transcription will run without LM", SCORER_PATH)

    log.info("Loading DeepSpeech-Quran model from %s", MODEL_PATH)
    m = Model(MODEL_PATH)
    if Path(SCORER_PATH).exists():
        m.enableExternalScorer(SCORER_PATH)
        # alpha/beta from the project's commands.txt (default_alpha=1.5, default_beta=1.85)
        m.setScorerAlphaBeta(1.5, 1.85)
    _model = m
    log.info("Model ready. Sample rate=%d, beam width=%d", m.sampleRate(), m.beamWidth())
    return _model


# --- App ---------------------------------------------------------------------

app = FastAPI(
    title="AyahQuest ASR",
    description="DeepSpeech-Quran inference sidecar",
    version="1.0.0",
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


# --- Schemas -----------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_path: str
    sample_rate: int


class TranscribeResponse(BaseModel):
    transcript: str
    sample_rate: int
    duration_sec: float


# --- Endpoints ---------------------------------------------------------------

@app.get("/health", response_model=HealthResponse)
def health():
    m = load_model()
    return HealthResponse(
        status="ok",
        model_loaded=m is not None,
        model_path=MODEL_PATH,
        sample_rate=SAMPLE_RATE,
    )


@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(audio: UploadFile = File(...)):
    """Transcribe an uploaded audio file to Arabic Quran text.

    Accepts any container ffmpeg understands (webm, ogg, mp4, wav…). The audio
    is normalized to 16 kHz / 16-bit / mono before being sent to the model.
    """
    m = load_model()
    if m is None:
        raise HTTPException(
            status_code=503,
            detail="ASR model not loaded. Check that the deepspeech package is installed and model files exist in ./models/.",
        )

    raw = await audio.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty audio upload")

    # Decode whatever the browser sent → 16k mono int16
    try:
        seg = AudioSegment.from_file(io.BytesIO(raw))
    except Exception as e:
        log.exception("audio decode failed")
        raise HTTPException(status_code=400, detail=f"Could not decode audio: {e}")

    seg = seg.set_channels(1).set_frame_rate(SAMPLE_RATE).set_sample_width(2)
    duration = len(seg) / 1000.0

    # Reasonable upper bound — protects against accidental long uploads.
    if duration > 60:
        raise HTTPException(status_code=413, detail="Audio too long (max 60s)")

    samples = np.array(seg.get_array_of_samples(), dtype=np.int16)

    log.info("Transcribing %.2fs of audio (%d samples)", duration, samples.size)
    transcript = m.stt(samples)
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
