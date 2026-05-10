// /api/diagnostic/* — placement test.

import { Router } from 'express';
import {
  DIAGNOSTIC_QUESTIONS,
  placementFromScore,
} from '../data/diagnostic.js';
import { getVerse } from '../data/quranContent.js';

const router = Router();

// GET /api/diagnostic — list of questions (with hydrated audio where needed)
router.get('/', (_req, res) => {
  const hydrated = DIAGNOSTIC_QUESTIONS.map((q) => {
    const out = { ...q };
    if (q.audio_verse_key) out.audio = getVerse(q.audio_verse_key);
    return out;
  });
  res.json({ questions: hydrated });
});

// POST /api/diagnostic/score — { answers: [{id, correct: boolean}] }
router.post('/score', (req, res) => {
  const { answers = [] } = req.body || {};
  let earned = 0;
  let possible = 0;
  for (const q of DIAGNOSTIC_QUESTIONS) {
    possible += q.weight;
    const ans = answers.find((a) => a.id === q.id);
    if (ans?.correct) earned += q.weight;
  }
  const scorePct = possible === 0 ? 0 : Math.round((earned / possible) * 100);
  const placement = placementFromScore(scorePct);
  res.json({ scorePct, ...placement });
});

export default router;
