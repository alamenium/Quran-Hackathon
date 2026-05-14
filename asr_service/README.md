# ASR sidecar — runtime notes

Project-level docs live in the **root [`README.md`](../README.md)** —
architecture, how the recitation check works, npm scripts, troubleshooting.

This file only documents knobs specific to running this Python service
directly. If you're using `npm run dev` from the repo root you can
skip it.

---

## What this service is

A FastAPI app wrapping [faster-whisper](https://github.com/SYSTRAN/faster-whisper)
(CTranslate2 reimplementation of Whisper). It downloads the chosen Whisper
checkpoint from Hugging Face on first boot and caches it under
`~/.cache/huggingface/`. There are **no model files committed in this
repo** — the `models/` directory still exists but is unused (kept for the
legacy DeepSpeech era and can be deleted).

## HTTP API

| Method | Path          | Description                                       |
|--------|---------------|---------------------------------------------------|
| GET    | `/health`     | Service status; `model_loaded: true` when ready   |
| POST   | `/transcribe` | multipart `audio` upload → `{ transcript, ... }`  |

`GET /health` response:

```json
{
  "status": "ok",
  "model_loaded": true,
  "model_path": "faster-whisper/small",
  "sample_rate": 16000
}
```

`POST /transcribe` accepts any container ffmpeg understands (WebM/Opus
from Chrome, OGG/Opus from Firefox, MP4/AAC from Safari, WAV).
ffmpeg + soundfile resample to 16 kHz / 16-bit / mono before inference.

## Environment variables

| Variable          | Default | Description                                                              |
|-------------------|---------|--------------------------------------------------------------------------|
| `PORT`            | `5005`  | HTTP port                                                                |
| `ASR_MODEL_SIZE`  | `small` | `tiny` `base` `small` `medium` `large-v2` `large-v3`                     |
| `ASR_DEVICE`      | `cpu`   | `cpu` or `cuda`                                                          |
| `ASR_COMPUTE_TYPE`| `int8`  | `int8` (fast CPU) · `float32` (precise CPU) · `float16` (CUDA)           |

Use `ASR_MODEL_SIZE=small` (or `tiny`) for fast first-boot during dev;
`medium` is the recommended production value for Quranic Arabic.

## Run it directly

Prerequisites: Python 3.10 / 3.11 / 3.12 and ffmpeg on PATH
(`brew install ffmpeg` or `sudo apt install ffmpeg`).

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python main.py
# → http://localhost:5005
```

The service logs `Model ready.` once the Whisper weights are cached.
Subsequent starts are instant. From the repo root the same thing happens
via `npm run dev:asr`, which is what `npm run dev` invokes automatically.

## Run it with Docker

```bash
docker build -t ayahquest-asr .
docker run -p 5005:5005 ayahquest-asr
```

Persist the model cache across container restarts:

```bash
docker run -p 5005:5005 \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  ayahquest-asr
```

## Performance notes

- On a modern x86 or Apple Silicon CPU, transcription of a 3-second
  ayah takes ~200–500 ms with `medium` / `int8`. `small` is roughly
  2× faster with a noticeable accuracy cost on long ayat.
- The model is warmed up in the FastAPI `startup` handler, so the first
  user request after boot doesn't pay the load cost.
- GPU is optional. Set `ASR_DEVICE=cuda` and `ASR_COMPUTE_TYPE=float16`
  on a CUDA machine.
- `/transcribe` enforces a 60-second upload limit; tune it in `main.py`
  if you need longer recordings.
