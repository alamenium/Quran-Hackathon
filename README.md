# AyahQuest

> A Duolingo-style Quran learning app for children and teens. Built on the
> Quran Foundation Content APIs, with **real Arabic ASR recitation
> verification** powered by faster-whisper.

AyahQuest teaches the Quran through short, friendly quests:
**listen, understand, practice, reflect, and review mistakes**. The
interface is a mobile-first PWA modelled on Duolingo's lesson loop and
Khan Academy Kids' storybook style.

This is the **only** project-level README. `asr_service/README.md` is
kept short and only covers sidecar runtime knobs (env vars, performance
tuning) — it never contradicts this file.

---

## Architecture at a glance

Three processes, one HTTP boundary between each pair:

```
  Browser (Vite :5173)
        │  /api/* (proxied)
        ▼
  Node API (Express :4000)
        │  /transcribe
        ▼
  Python ASR (FastAPI :5005)   ← faster-whisper, Arabic
```

- The **client** is React + Vite + Tailwind. It records audio with
  MediaRecorder and posts it to the Node API. If the ASR service is
  down it transparently falls back to the browser's Web Speech API.
- The **Node API** does Quran content, quests, progress, and recitation
  scoring. For audio it forwards the bytes to the Python sidecar.
- The **Python sidecar** (`asr_service/`) loads a faster-whisper model
  once at startup and exposes `POST /transcribe`. No model files are
  committed to the repo — Whisper weights download from Hugging Face
  on first boot and cache under `~/.cache/huggingface/`.

---

## Repository layout

```
ayahquest/
├── client/              React + Vite + Tailwind front-end (mobile-first PWA)
│   └── src/
│       ├── components/        Character, Header, AudioButton, …
│       ├── components/questions/   8 question-type renderers
│       ├── pages/             Home, Welcome, Diagnostic, Quest, Listen,
│       │                      Library, Story, Toolkit, Profile
│       ├── context/           ProgressContext (XP, streak, hearts)
│       ├── hooks/             useAudioRecorder, useSpeechRecognition
│       └── lib/               api client + character registry
├── server/              Node + Express API
│   └── src/
│       ├── routes/            /api/quran, /api/quests, /api/recitation,
│       │                      /api/progress, /api/stories, /api/diagnostic
│       ├── services/          Quran Foundation client, recitation scorer,
│       │                      ASR forwarder, JSON user store
│       └── data/              curriculum, Quran content, stories, diagnostic
├── asr_service/         Python FastAPI sidecar — faster-whisper Arabic ASR
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md             (runtime knobs only)
├── docker-compose.yml   One-command full-stack run
├── Dockerfile           Node API + client image
└── package.json         workspaces
```

---

## Feature set

- **Diagnostic placement test** — six quick questions; places the user
  at beginner / intermediate / advanced.
- **Roadmap** — sections → units → quests, in a Duolingo-style snake path.
- **Daily Quest** — one curated quest per day, deterministic per user.
- **Quest player** — eight question types:
  `choose_meaning`, `meaning_match`, `listen_choose`, `fill_blank`,
  `order_events`, `tap_ayah_lesson`, `reflection`, `recite`.
- **Soft hearts** — wrong answers cost a heart, but the quest never
  blocks a child; running out triggers **Review Mode** instead.
- **AI recitation verification** — faster-whisper transcribes Arabic
  recitation server-side; the Web Speech API is the fallback. Same
  scoring path for both. See *"How the recitation check works"* below.
- **Listen & Follow** — full surah view with audio, translation toggle,
  child-friendly tafsir toggle, and bookmarking.
- **Storybook Library** — illustrated Quran stories with read-along,
  ordering activity, and lesson question.
- **Toolkit** — mistakes review, saved words, bookmarks, reflections,
  badges, streak, and XP.
- **Character system** — drop-in folders, auto-detected.

---

## How the recitation check works

When the child taps the mic on a Recite question:

```
Browser                 Node API (:4000)               Python ASR (:5005)
───────                 ──────────────────              ──────────────────
MediaRecorder records
  WebM/Opus / MP4/AAC
         │
         └─POST /api/recitation/verify-audio ─▶
                                              ├──POST /transcribe (audio)──▶
                                              │                              ┌────────────┐
                                              │                              │ faster-    │
                                              │                              │ whisper    │
                                              │                              │ (lang=ar)  │
                                              │                              └────────────┘
                                              │                                    │
                                              │   { transcript, duration_sec } ◀───
                                              ▼
                                       normalize Arabic + Levenshtein
                                       vs canonical Uthmani text
         ◀── { score, status, transcript, source: "whisper" } ──
```

If the sidecar isn't reachable, the server responds **HTTP 503**, the
client flips to fallback mode, and the next mic tap uses
`webkitSpeechRecognition` instead. The scoring logic
(`compareRecitation`) is shared by both paths — only the transcription
source changes.

Mode is decided once on mount via `GET /api/recitation/asr-status`, so
the user sees a "🤖 AI Quran Recognition" or "🎙 Voice Recognition
(basic)" badge before recording.

---

## Quick start

### Prerequisites

- **Node.js 18+** (API and client)
- **Python 3.10, 3.11, or 3.12** (ASR sidecar)
- **ffmpeg** on PATH (used by the sidecar to decode browser audio)
- **npm 9+**

```bash
# macOS
brew install node python@3.11 ffmpeg

# Ubuntu / Debian
sudo apt install nodejs npm python3 python3-venv ffmpeg
```

### One command — everything

```bash
# Install once
npm run install:all
cd asr_service
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
cd ..

# Run everything (ASR + API + client) in one terminal
npm run dev
```

You should see three colour-coded streams: **ASR**, **API**, **WEB**.
Open <http://localhost:5173>. The API log line should say:

```
  ASR:         faster-whisper (small) @ http://localhost:5005
```

If it says **"not reachable"** instead, the Python sidecar isn't running
— see *"Troubleshooting: ASR always falls back"* below.

### Without the AI sidecar (fallback-only)

If you don't want to set up Python, run the rest of the app and let the
browser handle ASR:

```bash
npm run dev:basic     # API + client only, no ASR
```

The Recite question will use the browser's Web Speech API instead. The
UI badge will show "🎙 Voice Recognition (basic)".

### Docker compose (full stack in one command)

```bash
docker compose up --build
```

That builds both images, starts the ASR service first (gated by a
healthcheck), then the API+client image:

- **API + client** at <http://localhost:4000>
- **ASR sidecar** at <http://localhost:5005>

---

## Troubleshooting: ASR always falls back

If the UI badge says "🎙 Voice Recognition (basic)" instead of
"🤖 AI Quran Recognition", one of three things is true:

1. **The Python sidecar isn't running.**
   - Run `curl http://localhost:5005/health`. You should get
     `{"status":"ok","model_loaded":true,...}`.
   - If you get connection refused: start the sidecar with
     `npm run dev:asr` (or just `python asr_service/main.py`).
   - Note: `npm run dev` already starts all three processes.
     `npm run dev:basic` intentionally does not start the ASR.

2. **The model hasn't finished downloading yet.**
   - First boot pulls the Whisper checkpoint from Hugging Face (a few
     hundred MB for `small`, ~1.5 GB for `medium`). Watch the ASR log
     stream until you see `Model ready.`
   - Set `ASR_MODEL_SIZE=small` in `.env` to download faster while
     developing.

3. **The Node server can't reach the sidecar.**
   - Check `ASR_URL` in `.env` — it should be `http://localhost:5005`
     for bare-metal dev, or `http://asr:5005` inside docker-compose.
   - Visit `GET http://localhost:4000/api/health` and look at the
     `asr` block: `available: true, model_loaded: true` means the Node
     API is talking to Python.

---

## Production deployment

### Single VPS / Docker Compose

`docker-compose.yml` is production-ready. Set real env vars for the
Quran Foundation API and run `docker compose up -d --build`. Put nginx
or Caddy in front for TLS. Persist `server/data/` to a volume.

### Render / Railway / Fly.io

These platforms support multi-service deploys:

1. Deploy `asr_service/` as a Python service using its Dockerfile.
   Note the internal URL.
2. Deploy the repo root as a Node service with build command
   `npm run install:all && npm run build` and start `npm start`.
   Set `ASR_URL` to the Python service's URL.

### Without the AI sidecar

Just deploy the Node app. Recitation falls back to Web Speech API
automatically. Drop the `asr` block from `docker-compose.yml`.

---

## Configuration

All env vars live in `.env.example`. None are required for a basic demo.

| Variable           | Purpose                                                              |
|--------------------|----------------------------------------------------------------------|
| `QF_CLIENT_ID`     | Quran Foundation Content API credentials (optional)                  |
| `QF_CLIENT_SECRET` | (paired with above)                                                  |
| `QF_ENV`           | `prelive` or `production`                                            |
| `GEMINI_API_KEY`   | Gemini key for the AI tutor + tafsir simplifier (optional)           |
| `GEMINI_MODEL`     | Default `gemini-1.5-flash`                                           |
| `FIREBASE_*`       | Firestore service-account creds (optional; JSON file used otherwise) |
| `ASR_URL`          | Python sidecar URL (default `http://localhost:5005`)                 |
| `ASR_MODEL_SIZE`   | Whisper checkpoint: `tiny` `base` `small` `medium` `large-v2/v3`     |
| `PORT`             | Node API port (default 4000)                                         |
| `VITE_API_URL`     | Where the client posts API calls (default: same origin)              |

---

## API surface

All routes mounted under `/api`:

| Method | Path                          | Purpose                              |
|--------|-------------------------------|--------------------------------------|
| `GET`  | `/health`                     | Service status, including ASR        |
| `GET`  | `/quran/source`               | `live` or `offline`                  |
| `GET`  | `/quran/surahs`               | List surahs                          |
| `GET`  | `/quran/surahs/:id`           | Surah info + verses                  |
| `GET`  | `/quran/verse/:key`           | One verse (e.g. `1:1`)               |
| `GET`  | `/quran/words?theme=…`        | Word Explorer dictionary             |
| `GET`  | `/quests/roadmap`             | Sections → units → quests            |
| `GET`  | `/quests/daily`               | Today's quest                        |
| `GET`  | `/quests/:id`                 | Hydrated quest                       |
| `GET`  | `/diagnostic`                 | Placement questions                  |
| `POST` | `/diagnostic/score`           | Score and place                      |
| `GET`  | `/recitation/asr-status`      | Is the AI sidecar reachable?         |
| `POST` | `/recitation/verify`          | `{ verseKey, transcript }` → score   |
| `POST` | `/recitation/verify-audio`    | raw audio bytes → transcribe + score |
| `GET`  | `/progress`                   | User state                           |
| `POST` | `/progress/character`         | Set character                        |
| `POST` | `/progress/placement`         | Save diagnostic outcome              |
| `POST` | `/progress/quest-complete`    | Mark quest done, +XP, streak         |
| `POST` | `/progress/bookmark`          | Toggle bookmark                      |
| `POST` | `/progress/save-word`         | Toggle saved word                    |
| `POST` | `/progress/clear-mistake`     | Remove a fixed mistake               |
| `GET`  | `/stories`                    | Story list                           |
| `GET`  | `/stories/:id`                | Full story with pages + activity     |

Identification is by an opaque `x-user-id` header (auto-generated and
stored in `localStorage`).

---

## Adding more characters

The character system auto-detects folders that follow the same naming
scheme as `boy1`. To add a new character:

1. Create `client/public/characters/<id>/`.
2. Drop in PNGs named `<id>_<emotion>.png`. Supported emotions:
   `smile`, `happy`, `think`, `surprise`, `scared`, `star`, `football`,
   `quran_reading`. (Missing emotions fall back to `smile`.)
3. Add an entry to `client/src/lib/characters.js`.

The user can switch characters anytime on the Profile page.

---

## Data accuracy & content notes

A Quran app must be 100% correct. Here is what's in the bundled dataset:

- **Arabic text (Uthmani script)** — matches the canonical text
  distributed by the Quran Foundation Content APIs.
- **English translation** — Saheeh International translation.
- **Audio recitation** — Mishary Rashid Alafasy, served from the
  EveryAyah CDN.
- **Tafsir summaries** — short, child-friendly *paraphrases* written
  for ages 8–14. **Please have a qualified scholar review these**
  before publishing.
- **Stories** — based on Quranic narratives; wording is original.

---

## Tech stack

- **Frontend**: React 18, Vite 5, react-router-dom 6, TailwindCSS 3,
  MediaRecorder + Web Speech API.
- **Backend**: Node 18+, Express 4.
- **ASR sidecar**: Python 3.10+, FastAPI, faster-whisper (CTranslate2),
  ffmpeg subprocess + soundfile for audio I/O.
- **Recitation model**: OpenAI Whisper (Arabic, `small` default for dev,
  configurable up to `large-v3` for production accuracy).
- **Fonts**: Nunito (UI), Amiri Quran / Noto Naskh Arabic (Quranic text).

No database (JSON file storage by default), no GPU required, no
external paid services.

---

## License & credits

- **Character art**: provided by the user (`boy1.zip`).
- **Quran text & translation**: distributed by the Quran Foundation; see
  <https://quran.foundation>.
- **Recitation audio**: EveryAyah / Mishary Rashid Alafasy.
- **Whisper**: OpenAI, MIT.
- **faster-whisper**: SYSTRAN, <https://github.com/SYSTRAN/faster-whisper>, MIT.
- App code in this repository is released under the MIT License.
