// /api/ai/* — Gemini-powered features.
// All endpoints are constrained: input is approved lesson content only.

import { Router } from 'express';
import { gemini } from '../services/gemini.js';
import { getVerse } from '../data/quranContent.js';

const router = Router();

// GET /api/ai/status — is Gemini configured?
router.get('/status', (_req, res) => {
  res.json({ configured: gemini.configured() });
});

// POST /api/ai/simplify-tafsir
// body: { verseKey, tafsirText, targetAge?, source? }
router.post('/simplify-tafsir', async (req, res, next) => {
  try {
    const { verseKey, tafsirText, targetAge = 12, source = 'Ibn Kathir' } =
      req.body || {};
    if (!verseKey || !tafsirText) {
      return res.status(400).json({ error: 'verseKey and tafsirText required' });
    }
    const verse = getVerse(verseKey);
    if (!verse) return res.status(404).json({ error: 'Verse not found' });

    const simplified = await gemini.simplifyTafsir({
      verseKey,
      verseText: verse.text_uthmani,
      translation: verse.translation,
      tafsirText,
      targetAge,
      source,
    });
    res.json({ simplified, source });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/quiz
// body: { verseKey, simpleTafsir, words }
router.post('/quiz', async (req, res, next) => {
  try {
    const { verseKey, simpleTafsir, words } = req.body || {};
    if (!verseKey) return res.status(400).json({ error: 'verseKey required' });
    const verse = getVerse(verseKey);
    if (!verse) return res.status(404).json({ error: 'Verse not found' });

    const quiz = await gemini.generateQuiz({
      verseKey,
      verseText: verse.text_uthmani,
      translation: verse.translation,
      simpleTafsir: simpleTafsir || verse.tafsir_simple,
      words,
    });
    res.json({ quiz });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/tutor
// body: { userMessage, lessonContext, conversationHistory }
router.post('/tutor', async (req, res, next) => {
  try {
    const { userMessage, lessonContext, conversationHistory } = req.body || {};
    if (!userMessage?.trim()) {
      return res.status(400).json({ error: 'userMessage required' });
    }
    const result = await gemini.tutorAnswer({
      userMessage,
      lessonContext,
      conversationHistory,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/lesson-summary
// body: { verseKey, theme, wordsLearned, reflectionText }
router.post('/lesson-summary', async (req, res, next) => {
  try {
    const { verseKey, theme, wordsLearned, reflectionText } = req.body || {};
    const summary = await gemini.lessonSummary({
      verseKey,
      theme,
      wordsLearned,
      reflectionText,
    });
    res.json({ summary });
  } catch (err) {
    next(err);
  }
});

export default router;
