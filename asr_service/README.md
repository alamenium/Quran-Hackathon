# AyahQuest ASR sidecar

Python FastAPI service wrapping the DeepSpeech-Quran trained model
(github.com/tarekeldeeb/DeepSpeech-Quran) so the Node API can request real
Arabic Quran transcriptions.

The trained model was built in two stages by Tarek Eldeeb:

1. **Imam-only**: trained on 7 professional reciters covering the full Quran
   (~43k recordings). Achieves WER 5.7% / CER 4.0% on the held-out set.
2. **Imam + filtered Tarteel users**: same Imam corpus + 18,420 community
   recordings (filtered from 25k by acoustic acceptance threshold ≥ 0.15).
   Achieves WER 9.9% / CER 6.6%.

Bundled here is the version 2 model (Imam + filtered users), exported to
TensorFlow Lite for fast CPU inference.

## Files

```
asr_service/
├── main.py              # FastAPI app
├── requirements.txt     # Python deps
├── Dockerfile           # Container image
└── models/
    ├── quran.tflite     # Acoustic model (12 MB)
    ├── quran.scorer     # KenLM language model (1.7 MB)
    └── alphabet.txt     # Quran alphabet with tashkeel
```

## API

| Method | Path           | Description                                       |
|--------|----------------|---------------------------------------------------|
| GET    | `/health`      | Service status; `model_loaded: true` when ready   |
| POST   | `/transcribe`  | multipart `audio` upload → `{ transcript, ... }` |

The `/transcribe` endpoint accepts any audio container `ffmpeg` understands
(WebM/Opus from Chrome, OGG/Opus from Firefox, MP4/AAC from Safari, plain
WAV). It internally resamples to 16 kHz / 16-bit / mono before calling the
model.

## Run locally

```bash
cd asr_service
python3.9 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
# → http://localhost:5005
```

## Run with Docker

```bash
docker build -t ayahquest-asr .
docker run -p 5005:5005 ayahquest-asr
```

## Why DeepSpeech 0.9.3 (and not something newer)

Mozilla DeepSpeech was archived in 2020 and never got Python 3.10+ wheels.
The DeepSpeech-Quran model in this repo was trained against the 0.9.3 API,
so we pin to that. The 0.9.3 wheels still install cleanly on Linux/macOS x86
under Python 3.6–3.9.

If you want to upgrade to a newer ASR engine (Coqui STT, Whisper, etc.)
later, only `main.py` needs to change — the HTTP shape stays the same so
the Node service won't notice.

## Production notes

- The model is CPU-only. On a modern x86 server, transcription of a
  3-second ayah takes under 200ms. GPU acceleration is **not** needed.
- The first request after boot pays a one-time ~500ms model load cost; the
  service warms up in `@app.on_event("startup")` so this happens at boot,
  not on user request.
- `/transcribe` enforces a 60s upload limit; tune via the constant in
  `main.py` if you need longer ayat.
