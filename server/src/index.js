// AyahQuest API server entry point.
// Hosts: Quran content proxy, recitation verification, user progress.

// Load .env from the project root BEFORE any other import so that
// QF_CLIENT_ID, GEMINI_API_KEY, FIREBASE_*, etc. are available to every
// service at module-evaluation time — regardless of which CWD npm picks
// when running via `npm run dev:server` (workspace mode).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 
// server/src/index.js  →  ../../.env  →  <repo root>/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// Also load any local .env in the server workspace as a non-overriding overlay.
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: false });

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { existsSync } from 'node:fs';

import quranRouter from './routes/quran.js';
import questsRouter from './routes/quests.js';
import recitationRouter from './routes/recitation.js';
import progressRouter from './routes/progress.js';
import storiesRouter from './routes/stories.js';
import diagnosticRouter from './routes/diagnostic.js';
import aiRouter from './routes/ai.js';
import classesRouter from './routes/classes.js';
import compassRouter from './routes/compass.js';
import contentRouter from './routes/content.js';
import userRouter from './routes/user.js';
import authRouter from './routes/auth.js';
import gamesRouter from './routes/games.js';
import { sessionMiddleware } from './services/sessionStore.js';
import { asrHealth } from './services/recitation.js';

import ttsRoutes from "./routes/tts.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
// JSON limit covers transcripts; raw audio uploads bypass this via the
// audio-specific middleware in routes/recitation.js.
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Session middleware — MUST come before routes so req.session is available.
// Stores the QF OAuth2 tokens server-side in a signed httpOnly cookie.
// Tokens are never sent to the browser; only a session ID cookie is set.
app.use(sessionMiddleware);

// Health check
app.get('/api/health', async (_req, res) => {
  const asr = await asrHealth();
  res.json({
    status: 'ok',
    service: 'ayahquest-api',
    quranApi: process.env.QF_CLIENT_ID ? 'configured' : 'offline-fallback',
    asr: {
      available: asr.available || false,
      model_loaded: asr.model_loaded || false,
      url: process.env.ASR_URL || 'http://localhost:5005',
    },
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRouter);   // OAuth2 login/callback/logout/me
app.use('/api/quran', quranRouter);
app.use('/api/quests', questsRouter);
app.use('/api/recitation', recitationRouter);
app.use('/api/progress', progressRouter);
app.use('/api/stories', storiesRouter);
app.use('/api/diagnostic', diagnosticRouter);
app.use('/api/ai', aiRouter);
app.use('/api/classes', classesRouter);
app.use('/api/compass', compassRouter);
app.use('/api/content', contentRouter);
app.use('/api/user', userRouter);
app.use('/api/games', gamesRouter);
app.use("/api/tts", ttsRoutes);

// Serve client build in production (single-deploy mode)
const clientDist = path.resolve(__dirname, '../../client/dist');
if (existsSync(clientDist)) {
  console.log(`[server] Serving static client from ${clientDist}`);
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handler
app.use((err, _req, res, _next) => {
  console.error('[server error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, async () => {
  const asr = await asrHealth();
  console.log(`\n  AyahQuest API`);
  console.log(`  ─────────────`);
  console.log(`  Listening on http://localhost:${PORT}`);
  console.log(`  Health:      http://localhost:${PORT}/api/health`);
  console.log(`  Quran API:   ${process.env.QF_CLIENT_ID ? 'Quran Foundation (live)' : 'Offline dataset (no credentials)'}`);
  const asrUrl = process.env.ASR_URL || 'http://localhost:5005';
  if (asr.available && asr.model_loaded) {
    console.log(
      `  ASR:         faster-whisper (${asr.model_path || 'unknown'}) @ ${asrUrl}`
    );
  } else {
    console.log(`  ASR:         not reachable at ${asrUrl}`);
    console.log(`               → recitation falls back to the Web Speech API.`);
    console.log(`               → start the sidecar with:  npm run dev:asr`);
  }
  console.log('');
});
