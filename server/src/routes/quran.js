// /api/quran/* — Quran content endpoints.
// Tries Quran Foundation API when configured, falls back to bundled dataset.

import { Router } from 'express';
import { quranApi } from '../services/quranApi.js';
import {
  getVerse,
  listSurahs,
  getSurah,
  getVersesBySurah,
  listWords,
} from '../data/quranContent.js';

const router = Router();

// GET /api/quran/source — tells the client which data source is in use
router.get('/source', (_req, res) => {
  res.json({
    source: quranApi.isConfigured()
      ? 'quran-foundation-api'
      : 'offline-dataset',
  });
});

// GET /api/quran/surahs — list all surahs
router.get('/surahs', async (_req, res, next) => {
  try {
    if (quranApi.isConfigured()) {
      try {
        const data = await quranApi.callApi('/chapters');
        return res.json({ source: 'live', surahs: data.chapters });
      } catch (err) {
        console.warn('[quran] live API failed, falling back:', err.message);
      }
    }
    res.json({ source: 'offline', surahs: listSurahs() });
  } catch (err) {
    next(err);
  }
});

// GET /api/quran/surahs/:id — single surah info + verses
router.get('/surahs/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const surah = getSurah(id);
    if (!surah) return res.status(404).json({ error: 'Surah not found' });
    const verses = getVersesBySurah(id);
    res.json({ surah, verses });
  } catch (err) {
    next(err);
  }
});

// GET /api/quran/verse/:key — by verse key like "1:1"
router.get('/verse/:key', async (req, res, next) => {
  try {
    const verse = getVerse(req.params.key);
    if (!verse) return res.status(404).json({ error: 'Verse not found' });
    res.json({ verse });
  } catch (err) {
    next(err);
  }
});

// GET /api/quran/words — Word Explorer dictionary
router.get('/words', (req, res) => {
  res.json({ words: listWords({ theme: req.query.theme }) });
});

export default router;
