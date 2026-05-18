// AyahQuest API server entry point.
// Hosts: Quran content proxy, recitation verification, user progress.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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
import { asrHealth } from './services/recitation.js';

import ttsRoutes from "./routes/tts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
// JSON limit covers transcripts; raw audio uploads bypass this via the
// audio-specific middleware in routes/recitation.js.
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

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
app.use('/api/quran', quranRouter);
app.use('/api/quests', questsRouter);
app.use('/api/recitation', recitationRouter);
app.use('/api/progress', progressRouter);
app.use('/api/stories', storiesRouter);
app.use('/api/diagnostic', diagnosticRouter);
app.use('/api/ai', aiRouter);
app.use('/api/classes', classesRouter);
app.use('/api/compass', compassRouter);
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

