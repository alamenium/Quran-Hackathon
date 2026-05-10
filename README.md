# AyahQuest

> A Duolingo-style Quran learning app for children and teens. Built on the
> Quran Foundation Content APIs with **real AI Quran recitation recognition**
> powered by the DeepSpeech-Quran model.

AyahQuest teaches the Quran through short, friendly quests:
**listen, understand, practice, reflect, and review mistakes**. The
interface is a polished, mobile-first PWA modeled on Duolingo's lesson loop
and Khan Academy Kids' storybook style.

---

## What's inside

```
ayahquest/
├── client/              # React + Vite + Tailwind front-end (mobile-first PWA)
│   └── src/
│       ├── components/    ← Character, Header, AudioButton, …
│       ├── components/questions/  ← 8 question-type renderers
│       ├── pages/         ← Home, Welcome, Diagnostic, Quest, Listen,
│       │                    Library, Story, Toolkit, Profile
│       ├── context/       ← ProgressContext (XP, streak, hearts)
│       ├── hooks/         ← useAudioRecorder + useSpeechRecognition
│       └── lib/           ← api client + character registry
├── server/              # Node + Express API
│   └── src/
│       ├── routes/        ← /api/quran, /api/quests, /api/recitation,
│       │                    /api/progress, /api/stories, /api/diagnostic
│       ├── services/      ← Quran Foundation client, recitation scorer,
│       │                    ASR forwarder, JSON user store
│       └── data/          ← curriculum, Quran content, stories, diagnostic
├── asr_service/         # Python FastAPI sidecar — DeepSpeech-Quran AI
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── models/
│       ├── quran.tflite     (12 MB — acoustic model)
│       ├── quran.scorer     (1.7 MB — language model)
│       └── alphabet.txt
├── docker-compose.yml   # One-command full-stack run
├── Dockerfile           # Node API + client image
└── package.json         # workspaces
```

---

## Features (MVP scope)

- **Diagnostic placement test** — 6 quick questions, places the user at
  beginner / intermediate / advanced.
- **Roadmap** — sections → units → quests, in a Duolingo-style snake path.
- **Daily Quest** — one curated quest per day, deterministic per user.
- **Quest player** — eight question types:
  `choose_meaning`, `meaning_match`, `listen_choose`, `fill_blank`,
  `order_events`, `tap_ayah_lesson`, `reflection`, `recite`.
- **Soft hearts** — wrong answers cost a heart, but the quest never blocks
  a child; running out triggers **Review Mode** instead.
- **🤖 Real AI recitation verification** — the DeepSpeech-Quran model
  transcribes Arabic recitation server-side. With Web Speech API as a
  graceful fallback. (See full details below.)
- **Listen & Follow** — full surah view with audio, translation toggle,
  child-friendly tafsir toggle, and bookmarking.
- **Storybook Library** — illustrated Quran stories with read-along,
  ordering activity, and lesson question.
- **Toolkit** — mistakes review, saved words, bookmarks, reflections,
  badges, streak, and XP.
- **Character system** — drop-in folders, auto-detected.

---

## How AI recitation recognition works

When a child taps the mic and recites an ayah:

```
Browser                 Node API (:4000)            Python ASR (:5005)
───────                 ──────────────────           ──────────────────
MediaRecorder
  │
  └─ records audio
        (WebM/Opus or
         MP4/AAC)
                ──POST /api/recitation/verify-audio──▶
                                                        ──POST /transcribe──▶
                                                                              ┌──────────────┐
                                                                              │ DeepSpeech   │
                                                                              │ Quran .tflite│
                                                                              │  + scorer    │
                                                                              └──────────────┘
                                                                                      │
                                                                              Arabic transcript
                                                        ◀───────── transcript ────────
                                                  ┌─────────────────────────┐
                                                  │ Normalize Arabic +      │
                                                  │ Levenshtein vs canonical │
                                                  │ verse                    │
                                                  └─────────────────────────┘
                ◀─── { score, status, transcript } ───
```

**The model**: trained by Tarek Eldeeb on a two-stage corpus —
7 professional reciters (full Quran) plus 18,420 filtered Tarteel community
recordings. Achieves WER ≈ 9.9%, CER ≈ 6.6% on the held-out Quran test set.
The TensorFlow Lite version (12 MB) is bundled in `asr_service/models/`.

**The fallback**: when the Python sidecar isn't reachable, the client
automatically switches to the Web Speech API (browser-side Arabic STT
on Chrome/Android and Safari/iOS). Same scoring logic, lower accuracy.
Both paths share one `compareRecitation` function on the Node server.

---

## Quick start

### Prerequisites

- **Node.js 18+** (for the API and client)
- **Python 3.9** (for the AI sidecar — DeepSpeech wheels don't exist for newer Pythons)
- **ffmpeg** (auto-installed by the Python Dockerfile; on bare-metal you'll need it)
- npm 9+

### Option A — Docker compose (easiest, recommended)

```bash
docker compose up --build
```

That builds two images and starts the full stack:

- **API + client** at `http://localhost:4000`
- **ASR sidecar** at `http://localhost:5005`

Open `http://localhost:4000` on your phone or desktop browser.

### Option B — Bare metal (3 terminals)

**Terminal 1** — Python ASR:

```bash
cd asr_service
python3.9 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
# → http://localhost:5005
```

**Terminal 2** — Node API:

```bash
npm run install:all
npm run dev:server
# → http://localhost:4000
```

**Terminal 3** — Vite dev server:

```bash
npm run dev:client
# → http://localhost:5173
```

Open `http://localhost:5173` on a phone (same Wi-Fi → use your machine's
IP) or desktop. The Vite dev server proxies `/api/*` to port 4000.

### Option C — Bare metal (no Python, fallback only)

If you don't want to install Python, just skip Terminal 1. The Node API
will detect the absent sidecar and the Recite question will use the Web
Speech API instead. Everything else works identically.

```bash
npm run install:all
npm run dev
# Visit http://localhost:5173
```

---

## Production deployment

### Single VPS / Docker Compose

The `docker-compose.yml` file is production-ready. Add real env vars for
the Quran Foundation API and run:

```bash
docker compose up -d --build
```

Put nginx or Caddy in front for TLS. Persist `server/data/` to a volume.

### Render / Railway / Fly.io

These platforms support multi-service deploys:

1. Deploy `asr_service/` as a Python service with the included Dockerfile.
   Note its internal URL.
2. Deploy the root as a Node service with the build command
   `npm run install:all && npm run build` and start command `npm start`.
   Set `ASR_URL` to the Python service's URL.

### Without the AI sidecar

Just deploy the root Node app. The recitation feature still works via the
Web Speech API path. Drop or comment out the `asr` block in
`docker-compose.yml`.

---

## Configuration

All environment variables are listed in `.env.example`. None are required
for a basic demo.

| Variable           | Purpose                                                 |
|--------------------|---------------------------------------------------------|
| `QF_CLIENT_ID`     | Quran Foundation Content API credentials (optional)     |
| `QF_CLIENT_SECRET` | (paired with above)                                     |
| `QF_ENV`           | `prelive` or `production`                               |
| `ASR_URL`          | Python sidecar URL (default `http://localhost:5005`)    |
| `PORT`             | Node API port (default 4000)                            |
| `VITE_API_URL`     | Where the client posts API calls (default: same origin) |

---

## Adding more characters

The character system auto-detects folders that follow the same naming
scheme as `boy1`. To add a new character:

1. Create `client/public/characters/<id>/`
2. Drop in PNGs named `<id>_<emotion>.png`. Supported emotions:
   `smile`, `happy`, `think`, `surprise`, `scared`, `star`, `football`,
   `quran_reading`. (Missing emotions fall back to `smile`.)
3. Add an entry to `client/src/lib/characters.js`.

The user can switch characters anytime on the Profile page.

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

## Data accuracy & content notes

The user emphasized that **a Quran app must be 100% correct**. Here is
what's in the bundled dataset:

- **Arabic text (Uthmani script)** — matches the canonical text
  distributed by the Quran Foundation Content APIs.
- **English translation** — Saheeh International translation.
- **Audio recitation** — Mishary Rashid Alafasy, served from the
  EveryAyah CDN.
- **Tafsir summaries** — short, child-friendly *paraphrases* written for
  ages 8–14. **Please have a qualified scholar review these** before
  publishing.
- **Stories** — based on Quranic narratives; wording is original.

---

## Tech stack

- **Frontend**: React 18, Vite 5, react-router-dom 6, TailwindCSS 3,
  MediaRecorder + Web Speech API
- **Backend**: Node 18+, Express 4
- **AI sidecar**: Python 3.9, FastAPI, DeepSpeech 0.9.3 (TensorFlow Lite),
  pydub + ffmpeg for audio decoding
- **Recitation model**: DeepSpeech-Quran v2 (Imam + filtered Tarteel users),
  WER ≈ 9.9% / CER ≈ 6.6%
- **Fonts**: Nunito (UI), Amiri Quran / Noto Naskh Arabic (Quranic text)

No database (JSON file storage), no GPU required, no external paid services.

---

## License & credits

- **Character art**: provided by the user (`boy1.zip`).
- **Quran text & translation**: distributed by the Quran Foundation; see
  <https://quran.foundation>.
- **Recitation audio**: EveryAyah / Mishary Rashid Alafasy.
- **DeepSpeech-Quran model**: Tarek Eldeeb,
  <https://github.com/tarekeldeeb/DeepSpeech-Quran>, MPL-2.0.
- **DeepSpeech engine**: Mozilla, MPL-2.0.
- **Tarteel dataset**: used to train the v2 model
  (<https://github.com/Tarteel-io>).
- App code in this repository is released under the MIT License.
