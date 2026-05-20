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
//
// Per the brief (PART 9): if the lesson has an ayahKey but no fetched ayah
// text, ask the backend to hydrate it via the Content API (with local
// fallback) before passing context to Gemini. This keeps the tutor
// answering from real source material, never from memory.
router.post('/tutor', async (req, res, next) => {
  try {
    const { userMessage, conversationHistory } = req.body || {};
    let { lessonContext } = req.body || {};
    if (!userMessage?.trim()) {
      return res.status(400).json({ error: 'userMessage required' });
    }
    if (lessonContext?.ayahKey && !lessonContext.verseText) {
      try {
        // Inline hydration — re-use the same helper as the /content route.
        const { isConfigured, getVerseByKey } = await import(
          '../services/quranFoundationContentApi.js'
        );
        if (isConfigured()) {
          const v = await getVerseByKey(lessonContext.ayahKey);
          if (v) {
            lessonContext = {
              ...lessonContext,
              verseText: v.text_uthmani,
              translation:
                lessonContext.translation ||
                (v.translations && v.translations[0]?.text) ||
                null,
              hydratedFrom: 'Quran Foundation Content API v4',
            };
          }
        }
        // Local fallback
        if (!lessonContext.verseText) {
          const local = getVerse(lessonContext.ayahKey);
          if (local) {
            lessonContext = {
              ...lessonContext,
              verseText: local.text_uthmani,
              translation: lessonContext.translation || local.translation,
              hydratedFrom: 'local-cache',
            };
          }
        }
      } catch (err) {
        console.warn('[ai/tutor] hydration failed:', err.message);
      }
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
