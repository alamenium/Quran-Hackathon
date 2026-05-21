# AyahQuest

> A child-friendly Quran learning app that turns Quran learning from a school-like task into an engaging journey of guidance, stories, recitation, reflection, and discovery.

AyahQuest helps children and teens interact with the Quran through short quests, illustrated stories, read-aloud audio, recitation practice, reflection prompts, saved words, bookmarks, and simple educational games. The goal is to change the feeling from **"we have to learn Quran"** to **"the Quran is rich, meaningful, and full of guidance worth exploring."**

The app is built as a mobile-first React experience with a Node/Express backend. Quran content is served through the **Quran Foundation Content APIs** when credentials are configured, with a local verified fallback so the app still works during demos. User-linked features such as bookmarks, notes, streaks, goals, reading sessions, collections, and preferences are designed to sync through the **Quran Foundation User APIs** when the user connects an account, with a local/Firebase fallback when they are not signed in.

---

## One-sentence project summary

AyahQuest is a child-friendly Quran learning app that uses stories, quests, audio, recitation practice, simple games, and Quran API content to help children discover Quranic guidance with curiosity and interest.

---

## Problem it solves

Many children are raised to feel that interacting with the Quran is similar to schoolwork: something they must complete, memorize, or be tested on. AyahQuest solves this by presenting Quran learning as a warm, guided, and interactive experience where children explore meaning, values, stories, recitation, and reflection in a way that feels meaningful instead of forced.

---

## Core experience

AyahQuest is organized around a simple learning loop:

```text
Listen → Understand → Practice → Recite → Reflect → Save/Review
```

The child can learn through:

- short Quran-based quests
- guided ayah lessons
- illustrated storybooks
- read-aloud narration
- recitation practice
- child-safe reflections
- bookmarks and saved words
- progress, XP, streaks, badges, and hearts
- simple educational games, including prophet-story guessing without prophet images

---

## Main features

### 1. Learn

The Learn flow gives the child structured Quran learning through short quests.

- **Diagnostic placement test**: places the child at beginner, intermediate, or advanced level.
- **Roadmap**: sections, units, and quests in a friendly path.
- **Daily Quest**: one selected quest per day.
- **Quest player**: supports multiple question types:
  - `choose_meaning`
  - `meaning_match`
  - `listen_choose`
  - `fill_blank`
  - `order_events`
  - `tap_ayah_lesson`
  - `reflection`
  - `recite`
- **Soft hearts system**: wrong answers reduce hearts, but the app does not punish the child harshly.
- **Review Mode**: helps the child revisit mistakes instead of feeling blocked.

### 2. Compass

The Compass flow helps the child explore Quranic guidance by meaning and theme.

- thematic Quran exploration
- child-friendly lessons around values and guidance
- saved ayahs and words
- reflection-based learning
- gentle prompts that connect Quranic meaning to daily life

### 3. Recite

The Recite flow supports Quran recitation practice.

- records child recitation in the browser
- sends audio to the backend for verification
- uses Arabic ASR through the Python sidecar when available
- falls back to browser Web Speech API when the ASR service is unavailable
- compares the transcript against the target ayah using Arabic normalization and similarity scoring
- returns friendly feedback instead of harsh correction

### 4. Listen & Follow

The Listen experience helps children hear and follow Quranic recitation.

- full surah or ayah listening
- Quran audio playback
- translation toggle
- child-friendly tafsir/meaning toggle
- bookmarking
- reading-session tracking when Quran Foundation User APIs are connected

### 5. Storybook Library

AyahQuest includes illustrated Quran-inspired storybooks for children.

- short stories built around Quranic values and guidance
- simple child-friendly text
- page-by-page illustrations
- read-aloud narration
- ordering activities
- lesson questions
- no images or depictions of prophets

### 6. Prophet-story guessing game

The app includes a simple educational game where the child guesses the prophet from a short story clue.

- shows a short, simple story clue
- uses objects and events as hints
- avoids showing images of prophets
- reinforces Quranic stories in a safe, child-friendly way
- designed to use structured content/API-backed data rather than hard-coded one-off screens

### 7. AI tutor

The AI tutor helps explain Quran-related concepts in a child-safe way.

- answers simple learning questions
- explains meanings gently
- avoids replacing scholarly sources
- uses guardrails for child-friendly language
- can simplify tafsir-style explanations for the app experience

### 8. Toolkit

The Toolkit collects the child’s learning history.

- mistakes review
- saved words
- bookmarks
- reflections
- badges
- streak
- XP
- goals
- reading history

### 9. Character and visual system

AyahQuest uses a friendly character system to make the app feel warm and personal.

- boy and girl character assets
- emotional poses for learning states
- consistent visual style
- simple, child-friendly illustrations
- no prophet depiction
- character folders can be extended with new emotions and poses

---

## Architecture at a glance

```text
Browser / React app (Vite)
        │
        │ /api/*
        ▼
Node API / Express backend
        │
        ├── Quran Foundation Content APIs
        ├── Quran Foundation User APIs
        ├── Gemini API for child-safe tutor support
        ├── ElevenLabs API for text-to-speech/read-aloud audio
        ├── Local/Firebase fallback storage
        │
        └── Python ASR sidecar / FastAPI
                 │
                 └── faster-whisper Arabic transcription
```

### Client

- React + Vite
- TailwindCSS
- mobile-first PWA-style interface
- records audio using `MediaRecorder`
- uses Web Speech API as fallback for recitation
- stores an opaque user ID in `localStorage` for local progress

### Backend

- Node.js + Express
- handles Quran content, quests, progress, stories, AI tutor routes, TTS routes, and recitation scoring
- protects API keys and OAuth tokens server-side
- forwards audio to the Python ASR service when available
- falls back to local/Firebase storage when external user APIs are not connected

### ASR sidecar

- Python + FastAPI
- faster-whisper Arabic ASR
- receives audio from Node backend
- returns transcript and duration
- supports local development and Docker-based deployment

---

## Repository layout

```text
ayahquest/
├── client/                         React + Vite + Tailwind frontend
│   └── src/
│       ├── components/             Shared UI, character, audio, navigation
│       ├── components/questions/   Quest question renderers
│       ├── pages/                  Learn, Compass, Recite, Listen, Story,
│       │                           Toolkit, Profile, Diagnostic, Quest
│       ├── context/                Progress, XP, hearts, streaks
│       ├── hooks/                  Audio recorder and speech recognition hooks
│       └── lib/                    API client and character registry
├── server/                         Node + Express backend
│   └── src/
│       ├── routes/                 API routes
│       ├── services/               Quran API client, AI, TTS, ASR, scoring,
│       │                           fallback storage
│       └── data/                   Curriculum, stories, cached Quran content
├── asr_service/                    Python FastAPI ASR sidecar
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
├── docker-compose.yml              Full-stack Docker run
├── Dockerfile                      Node API + built client image
├── package.json                    Workspaces and scripts
└── README.md
```

---

## API usage overview

AyahQuest uses APIs in a server-first way. Tokens and secrets are not exposed to the browser.

| API / Service | Used for | Runtime role |
|---|---|---|
| Quran Foundation Content APIs | Quran text, translations, tafsir resources, recitation audio, chapters, pages, juz content | Main Quran content provider |
| Quran Foundation User APIs | bookmarks, notes/reflections, streaks, goals, reading sessions, preferences, collections, tags, profile | Optional signed-in sync provider |
| quran.ai | Quranic guidance/content research support during development | Used to guide and verify content design; not a replacement for Quran Foundation runtime APIs |
| Gemini API | child-safe tutor responses and simplified explanations | Optional AI support |
| ElevenLabs API | read-aloud narration and story/lesson TTS | Optional audio generation/playback support |
| faster-whisper / Python ASR | Arabic recitation transcription | Optional AI recitation verification sidecar |
| Web Speech API | browser fallback speech recognition | Fallback when ASR sidecar is unavailable |
| Firebase / local JSON storage | progress, notes, bookmarks, goals, streaks when QF user sync is unavailable | Fallback persistence |

---

## Quran Foundation Content APIs

**Purpose:** provide Quranic content for lessons, quests, listening, and exploration.

**Authentication:** OAuth2 Client Credentials.

```text
grant_type=client_credentials
QF_CLIENT_ID + QF_CLIENT_SECRET → bearer token
```

The backend fetches and caches the bearer token. The browser never receives the token.

### Content endpoints used

| Quran Foundation endpoint | AyahQuest backend route | Purpose |
|---|---|---|
| `GET /verses/by_key/{verse_key}` | `GET /api/content/lesson/:ayahKey` | Arabic text, translation, tafsir, and lesson content for one ayah |
| `GET /chapters/{id}` | used inside lesson hydration | Surah name and metadata |
| `GET /recitations/{id}/by_ayah/{verse_key}` | `GET /api/content/audio/:ayahKey` | Recitation audio URL |
| `GET /chapters` | `GET /api/content/chapters` | Full chapter list |
| `GET /resources/translations` | `GET /api/content/resources` | Translation editions |
| `GET /resources/tafsirs` | `GET /api/content/resources` | Tafsir editions |
| `GET /resources/recitations` | `GET /api/content/resources` | Reciter resources |
| `GET /verses/by_page/{page}` | `GET /api/content/page/:n` | Page-based verse browsing |
| `GET /verses/by_juz/{juz}` | `GET /api/content/juz/:n` | Juz-based verse browsing |

### Where Content API data appears

- quest ayah lessons
- Listen step audio
- surah/chapter browsing
- Compass Quran exploration
- translation and tafsir/meaning toggles
- source badge showing live API or local cache

### Content API fallback

If Quran Foundation credentials are missing or the API is unreachable, the app uses the bundled local dataset. The UI should show a local-cache source state instead of failing.

---

## Quran Foundation User APIs

**Purpose:** sync user-specific Quran learning activity when the user connects their Quran.Foundation account.

**Authentication:** OAuth2 Authorization Code + PKCE.

### User auth flow

1. User taps **Connect Quran Foundation**.
2. Browser opens `GET /api/auth/login`.
3. Server creates PKCE verifier/challenge and redirects to Quran Foundation authorization.
4. Quran Foundation redirects to `GET /api/auth/callback`.
5. Server validates state and exchanges the code for tokens.
6. Tokens are stored server-side only.
7. Browser receives an httpOnly signed session cookie.
8. React checks login state with `GET /api/auth/me`.
9. `GET /api/auth/logout` clears the session.

### User API endpoints used

| Quran Foundation User API | AyahQuest backend route | Used for |
|---|---|---|
| `GET /users/me` | `GET /api/user/me` | Profile identity |
| `POST /bookmarks` | `POST /api/user/bookmarks` | Save ayah bookmark |
| `GET /bookmarks` | `GET /api/user/bookmarks` | Load saved bookmarks |
| `DELETE /bookmarks/{id}` | `DELETE /api/user/bookmarks/:id` | Remove bookmark |
| `POST /notes` | `POST /api/user/notes` | Save child reflection |
| `GET /notes` | `GET /api/user/notes` | Load reflections |
| `GET /streaks` | `GET /api/user/streaks` | Header/profile streak |
| `GET /activity-days` | `GET /api/user/activity-days` | Activity calendar |
| `POST /reading-sessions` | `POST /api/user/reading-sessions` | Track listening/reading activity |
| `GET /goals` | `GET /api/user/goals` | Load daily goals |
| `POST /goals` | `POST /api/user/goals` | Save/update goals |
| `GET /preferences` | `GET /api/user/preferences` | Load translation/tafsir preferences |
| `PATCH /preferences` | `POST /api/user/preferences` | Save preferences |
| `GET /collections` | `GET /api/user/collections` | Load grouped ayah collections |
| `POST /collections` | `POST /api/user/collections` | Create grouped collections |
| `GET /tags` | `GET /api/user/tags` | Load note/bookmark tags |
| `POST /tags` | `POST /api/user/tags` | Create note/bookmark tags |

### Where User API data appears

- Profile / side drawer account status
- Toolkit bookmarks
- Toolkit reflections
- saved ayahs
- quest reflection step
- Listen step reading sessions
- header streak chip
- daily goals
- collections and tags

### User API fallback

If the user is not signed in, or if credentials are missing, the app falls back to local/Firebase storage while keeping the same frontend behavior.

---

## AI tutor and explanation API

AyahQuest includes an optional AI tutor route for child-friendly help.

| Route | Purpose |
|---|---|
| `POST /api/ai/tutor` | Returns a safe, simple explanation for a child question or lesson prompt |

The tutor should follow Quran safety rules:

- keep answers short and age-appropriate
- avoid unsupported religious claims
- avoid pretending to be a scholar
- avoid issuing fatwas
- encourage asking parents/teachers for sensitive questions
- use Quran Foundation content and verified app content where possible

Required environment variable:

```bash
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```

If no Gemini key is configured, the app should use a safe fallback message or local explanation content.

---

## Text-to-speech / read-aloud API

AyahQuest uses optional text-to-speech support for read-aloud story and lesson experiences.

| Route | Purpose |
|---|---|
| `POST /api/tts` | Converts selected story/lesson text into audio using a configured voice |

Typical voice roles:

- child voice
- teacher voice
- narrator voice

Required environment variable:

```bash
ELEVENLABS_API_KEY=
```

If the key is missing, the app can still play uploaded/local voiceover files or run without generated TTS.

---

## Recitation verification

When a child records recitation, AyahQuest verifies it through this flow:

```text
Browser records audio
        │
        ▼
POST /api/recitation/verify-audio
        │
        ▼
Node backend forwards audio to Python ASR sidecar
        │
        ▼
POST /transcribe
        │
        ▼
faster-whisper transcribes Arabic speech
        │
        ▼
Node normalizes Arabic and compares transcript with target ayah
        │
        ▼
Response: score, status, transcript, feedback, source
```

### Recitation routes

| Route | Purpose |
|---|---|
| `GET /api/recitation/asr-status` | Checks whether the ASR sidecar is available |
| `POST /api/recitation/verify-audio` | Accepts raw audio, transcribes it, and scores recitation |
| `POST /api/recitation/verify` | Scores an already-provided transcript |
| `POST /transcribe` | Python ASR sidecar endpoint |

### Fallback behavior

If the ASR sidecar is unavailable:

- backend returns unavailable state
- frontend switches to Web Speech API
- scoring still uses the same comparison logic
- UI shows basic voice recognition instead of AI Quran recognition

---

## Backend API surface

All main app routes are mounted under `/api`.

### System and status

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | App health, backend status, ASR status |
| `GET` | `/api/content/status` | Active Quran content provider |
| `GET` | `/api/user/status` | Active user provider and auth state |

### Quran content

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/quran/source` | Shows live/offline Quran source |
| `GET` | `/api/quran/surahs` | Lists surahs |
| `GET` | `/api/quran/surahs/:id` | Returns surah info and verses |
| `GET` | `/api/quran/verse/:key` | Returns one verse, such as `1:1` |
| `GET` | `/api/quran/words?theme=...` | Word Explorer dictionary by theme |
| `GET` | `/api/content/lesson/:ayahKey` | Hydrated live/local lesson content |
| `GET` | `/api/content/audio/:ayahKey` | Audio URL for an ayah |
| `GET` | `/api/content/chapters` | Chapter list from QF/local cache |
| `GET` | `/api/content/resources` | Translation, tafsir, and reciter resources |
| `GET` | `/api/content/page/:n` | Page-based verse browsing |
| `GET` | `/api/content/juz/:n` | Juz-based verse browsing |

### Quests and learning

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/diagnostic` | Placement questions |
| `POST` | `/api/diagnostic/score` | Scores placement test |
| `GET` | `/api/quests/roadmap` | Sections, units, and quests |
| `GET` | `/api/quests/daily` | Daily quest |
| `GET` | `/api/quests/:id` | Full quest data |

### Stories and games

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/stories` | Story list |
| `GET` | `/api/stories/:id` | Full story with pages and activities |
| `GET` | `/api/games/prophet-guess` | Prophet guessing game prompts/clues, if enabled |

### Progress

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/progress` | User state |
| `POST` | `/api/progress/character` | Set active character |
| `POST` | `/api/progress/placement` | Save placement result |
| `POST` | `/api/progress/quest-complete` | Mark quest complete and add XP/streak |
| `POST` | `/api/progress/bookmark` | Toggle bookmark locally/fallback |
| `POST` | `/api/progress/save-word` | Toggle saved word |
| `POST` | `/api/progress/clear-mistake` | Remove reviewed mistake |

### Auth and user sync

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/auth/login` | Start Quran Foundation OAuth login |
| `GET` | `/api/auth/callback` | OAuth callback |
| `GET` | `/api/auth/me` | Current auth state |
| `GET` | `/api/auth/logout` | End session |
| `GET/POST/DELETE` | `/api/user/*` | Server-side proxy/fallback for user APIs |

---

## Environment variables

Create a `.env` file based on `.env.example`.

### Core

| Variable | Purpose |
|---|---|
| `PORT` | Node API port, default `4000` |
| `CLIENT_URL` | Frontend URL, default `http://localhost:5173` |
| `VITE_API_URL` | API URL used by the client |

### Quran Foundation

| Variable | Purpose |
|---|---|
| `QF_CLIENT_ID` | Quran Foundation OAuth client ID |
| `QF_CLIENT_SECRET` | Quran Foundation OAuth client secret |
| `QF_ENV` | `prelive` or `production` |
| `QF_REDIRECT_URI` | OAuth callback, default `http://localhost:4000/api/auth/callback` |
| `QF_SCOPES` | User API scopes, e.g. `openid offline_access bookmark collection user` |
| `QF_TRANSLATION_ID` | Translation resource ID |
| `QF_TAFSIR_ID` | Tafsir resource ID |
| `QF_RECITER_ID` | Reciter resource ID |
| `SESSION_SECRET` | Secret for signing httpOnly session cookies |

### AI, audio, and ASR

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | AI tutor and explanation support |
| `GEMINI_MODEL` | Gemini model name |
| `ELEVENLABS_API_KEY` | Read-aloud/TTS support |
| `ASR_URL` | Python sidecar URL, default `http://localhost:5005` |
| `ASR_MODEL_SIZE` | Whisper model size: `tiny`, `base`, `small`, `medium`, `large-v2`, `large-v3` |

### Storage

| Variable | Purpose |
|---|---|
| `FIREBASE_*` | Optional Firebase/Firestore service-account configuration |

None of these are required for a basic local demo because the app can run with local cached content and local progress storage.

---

## Quick start

### Prerequisites

- Node.js 18+
- npm 9+
- Python 3.10+ for ASR sidecar
- ffmpeg on PATH for audio decoding
- Docker Desktop if using Docker Compose

### Install

```bash
npm run install:all
```

### Run frontend + backend only

```bash
npm run dev:basic
```

Open:

```text
http://localhost:5173
```

Use this when you do not need the Python ASR service.

### Run full stack with ASR

```bash
npm run dev
```

This starts:

- API server
- React client
- Python ASR sidecar

### Run with Docker Compose

```bash
docker compose up --build
```

Expected local services:

```text
Client: http://localhost:5173
API:    http://localhost:4000
ASR:    http://localhost:5005
```

---

## Troubleshooting

### ASR always falls back to basic voice recognition

Check:

```bash
curl http://localhost:5005/health
```

If the sidecar is not reachable:

```bash
npm run dev:asr
```

Also check:

```bash
curl http://localhost:4000/api/health
```

The ASR block should show that the sidecar is available.

### Quran content shows local cache

This usually means Quran Foundation credentials are missing or the API request failed.

Check:

```bash
curl http://localhost:4000/api/content/status
```

Then verify:

```bash
QF_CLIENT_ID=
QF_CLIENT_SECRET=
QF_ENV=prelive
```

### Quran Foundation login does not work

Check:

```bash
QF_REDIRECT_URI=http://localhost:4000/api/auth/callback
SESSION_SECRET=
CLIENT_URL=http://localhost:5173
```

The redirect URI must exactly match the URI registered in the Quran Foundation app settings.

---

## Data accuracy and safety notes

Because this is a Quran learning app, content accuracy and religious safety are critical.

- Quran text should come from Quran Foundation Content APIs when available.
- Local fallback content should be verified before public release.
- Tafsir summaries and child-friendly explanations are simplified educational paraphrases.
- Sensitive religious questions should direct the child to a parent, teacher, or qualified scholar.
- Prophet stories must avoid invented religious claims.
- The app must never depict prophets in images.
- AI-generated explanations should not be treated as scholarly authority.

---

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, React Router |
| Backend | Node.js, Express |
| Quran APIs | Quran Foundation Content APIs, Quran Foundation User APIs |
| AI tutor | Gemini API |
| TTS | ElevenLabs API |
| Recitation ASR | Python, FastAPI, faster-whisper, ffmpeg |
| Browser fallback | Web Speech API, MediaRecorder |
| Storage | Local JSON storage, optional Firebase/Firestore |
| Deployment | Docker, Docker Compose |

---

## Credits

- Quran content and API infrastructure: Quran Foundation
- Quranic study guidance during content design: quran.ai
- Recitation audio/resources: Quran Foundation / configured recitation providers
- AI tutor support: Gemini API
- Text-to-speech support: ElevenLabs
- Arabic ASR: faster-whisper / Whisper
- Character and story visuals: project team assets

---

## License

MIT License, unless otherwise specified by third-party assets or API providers.
