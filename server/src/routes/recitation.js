// /api/recitation/* — recitation verification.
//
// Two endpoints:
//   POST /verify        { verseKey, transcript }   → score
//   POST /verify-audio  raw body: audio bytes      → transcribe + score
//   GET  /asr-status                                → is the AI sidecar up?

import express, { Router } from 'express';
import {
  compareRecitation,
  asrHealth,
  transcribeAudio,
} from '../services/recitation.js';

const router = Router();

// Cache the ASR availability check so we don't probe Python on every request.
let asrCache = { ts: 0, info: null };
async function cachedAsrHealth() {
  const now = Date.now();
  if (asrCache.info && now - asrCache.ts < 10_000) return asrCache.info;
  asrCache = { ts: now, info: await asrHealth() };
  return asrCache.info;
}

router.get('/asr-status', async (_req, res) => {
  const info = await cachedAsrHealth();
  res.json(info);
});

// --- Transcript-based verification (Web Speech API path) -------------------
router.post('/verify', (req, res) => {
  const { verseKey, transcript } = req.body || {};
  if (!verseKey) return res.status(400).json({ error: 'verseKey required' });
  const result = compareRecitation({ verseKey, transcript });
  res.json({ ...result, source: 'web-speech' });
});

// --- Audio-based verification (DeepSpeech-Quran path) ----------------------
//
// Accepts raw audio bytes in the request body. The client sends:
//   Content-Type: audio/webm  (or audio/wav, audio/ogg, etc.)
//   X-Verse-Key:  1:1
//
// We forward to the Python ASR sidecar, get an Arabic transcript back, then
// score it against the canonical Arabic. Falls back gracefully (HTTP 503)
// if the sidecar is unreachable so the client can switch to /verify.

const rawAudio = express.raw({
  type: ['audio/*', 'application/octet-stream'],
  limit: '8mb',
});

router.post('/verify-audio', rawAudio, async (req, res, next) => {
  try {
    const verseKey = req.header('x-verse-key') || req.query.verseKey;
    if (!verseKey) {
      return res.status(400).json({ error: 'X-Verse-Key header required' });
    }
    const audioBuffer = req.body;
    if (!audioBuffer || !audioBuffer.length) {
      return res.status(400).json({ error: 'Empty audio body' });
    }

    const health = await cachedAsrHealth();
    if (!health.available || !health.model_loaded) {
      return res.status(503).json({
        error: 'ASR service not available',
        hint:
          'The DeepSpeech-Quran sidecar is not running. Start it with `cd asr_service && python main.py`, or use POST /verify with a Web Speech API transcript.',
      });
    }

    // Pick a sane filename so pydub picks the right decoder.
    const ct = (req.header('content-type') || '').toLowerCase();
    const filename = ct.includes('webm')
      ? 'rec.webm'
      : ct.includes('ogg')
      ? 'rec.ogg'
      : ct.includes('mp4') || ct.includes('m4a')
      ? 'rec.m4a'
      : ct.includes('wav')
      ? 'rec.wav'
      : 'rec.webm';

    const asr = await transcribeAudio(audioBuffer, filename);
    const result = compareRecitation({ verseKey, transcript: asr.transcript });

    res.json({
      ...result,
      source: 'deepspeech-quran',
      asr: {
        sample_rate: asr.sample_rate,
        duration_sec: asr.duration_sec,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
