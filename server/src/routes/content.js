// server/src/routes/content.js
//
// /api/content/* — Quran Foundation Content API v4.0.0 surface.
//
// The "lesson hydration" pattern: backend assembles ayah text + translation
// + tafsir + audio + chapter + page/juz metadata into a single shape that
// the frontend can render directly. This is intentional — the brief says
// "Do NOT make the frontend assemble Quran data from hardcoded ayah numbers
// alone." Lesson hydration also satisfies the no-ayah-number-only-exercises
// rule because the UI ALWAYS has actual Arabic + translation in hand.

import { Router } from 'express';
import {
  isConfigured as qfConfigured,
  QF_DEFAULTS,
  listChapters,
  getChapter,
  listTranslations,
  listTafsirs,
  listRecitations,
  getVerseByKey,
  getVersesByPage,
  getVersesByJuz,
  getAyahAudio,
} from '../services/quranFoundationContentApi.js';
import { getVerse, getSurah } from '../data/quranContent.js';

const router = Router();

// Strip HTML tags from translation/tafsir text (the QF responses contain
// inline <sup> footnote markers and similar). Keep things kid-friendly.
function stripHtml(s) {
  if (!s) return s;
  return String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

// GET /api/content/status — which provider is active
router.get('/status', (_req, res) => {
  res.json({
    contentApi: qfConfigured() ? 'quran-foundation-v4' : 'offline-fallback',
    defaults: QF_DEFAULTS,
  });
});

// GET /api/content/resources — translations + tafsirs + recitations registry
router.get('/resources', async (_req, res, next) => {
  try {
    if (!qfConfigured()) {
      return res.json({
        source: 'offline',
        translations: [], tafsirs: [], recitations: [],
        note: 'Configure QF_CLIENT_ID/QF_CLIENT_SECRET to list real resources.',
      });
    }
    const [translations, tafsirs, recitations] = await Promise.all([
      listTranslations().catch(() => []),
      listTafsirs().catch(() => []),
      listRecitations().catch(() => []),
    ]);
    res.json({ source: 'live', translations, tafsirs, recitations });
  } catch (err) { next(err); }
});

// GET /api/content/chapters — full chapter list
router.get('/chapters', async (_req, res, next) => {
  try {
    if (!qfConfigured()) {
      return res.json({ source: 'offline', chapters: [] });
    }
    const chapters = await listChapters();
    res.json({ source: 'live', chapters });
  } catch (err) { next(err); }
});

// GET /api/content/audio/:ayahKey — audio metadata for one ayah
router.get('/audio/:ayahKey', async (req, res, next) => {
  try {
    const ayahKey = req.params.ayahKey;
    if (!qfConfigured()) {
      // Fallback: derive an EveryAyah-style URL from the local dataset.
      const v = getVerse(ayahKey);
      if (v?.audio_url) return res.json({ source: 'offline', url: v.audio_url });
      return res.status(404).json({ error: 'No audio available' });
    }
    const reciterId = req.query.reciterId || QF_DEFAULTS.reciterId;
    const audio = await getAyahAudio(ayahKey, reciterId);
    if (!audio) return res.status(404).json({ error: 'No audio available' });
    res.json({ source: 'live', ...audio });
  } catch (err) { next(err); }
});

// GET /api/content/page/:pageNumber — verses for a page
router.get('/page/:pageNumber', async (req, res, next) => {
  try {
    if (!qfConfigured()) {
      return res.status(503).json({ error: 'QF Content API not configured' });
    }
    res.json({ source: 'live', ...(await getVersesByPage(req.params.pageNumber)) });
  } catch (err) { next(err); }
});

// GET /api/content/juz/:juzNumber — verses for a juz
router.get('/juz/:juzNumber', async (req, res, next) => {
  try {
    if (!qfConfigured()) {
      return res.status(503).json({ error: 'QF Content API not configured' });
    }
    res.json({ source: 'live', ...(await getVersesByJuz(req.params.juzNumber)) });
  } catch (err) { next(err); }
});

// GET /api/content/lesson/:ayahKey — the headline endpoint
//
// Assembles a "lesson-ready" view of one ayah from the QF Content API.
// Falls back transparently to local quranContent.js / quranAiContentPack.js
// when QF is unreachable, so the demo NEVER shows a blank lesson.
router.get('/lesson/:ayahKey', async (req, res, next) => {
  try {
    const ayahKey = req.params.ayahKey;
    const [chapterNum, ayahNum] = ayahKey.split(':').map(Number);
    if (!chapterNum || !ayahNum) {
      return res.status(400).json({ error: 'Invalid verse key' });
    }
    const translationId = req.query.translationId || QF_DEFAULTS.translationId;
    const tafsirId      = req.query.tafsirId      || QF_DEFAULTS.tafsirId;
    const reciterId     = req.query.reciterId     || QF_DEFAULTS.reciterId;

    // --- Try live first --------------------------------------------------
    if (qfConfigured()) {
      try {
        const [verse, chapter, audio] = await Promise.all([
          getVerseByKey(ayahKey, { translations: translationId, tafsirs: tafsirId }),
          getChapter(chapterNum).catch(() => null),
          getAyahAudio(ayahKey, reciterId).catch(() => null),
        ]);
        if (verse) {
          const translation = (verse.translations && verse.translations[0]) || null;
          const tafsir = (verse.tafsirs && verse.tafsirs[0]) || null;
          return res.json({
            ayahKey,
            arabic: verse.text_uthmani || verse.text_imlaei,
            translation: stripHtml(translation?.text),
            tafsir: stripHtml(tafsir?.text),
            audioUrl: audio?.url || null,
            chapter: chapter ? {
              number: chapter.id,
              name: chapter.name_simple,
              nameArabic: chapter.name_arabic,
              revelationPlace: chapter.revelation_place,
              versesCount: chapter.verses_count,
            } : { number: chapterNum, name: null },
            metadata: {
              juz: verse.juz_number,
              page: verse.page_number,
              hizb: verse.hizb_number,
              ruku: verse.ruku_number,
              verseNumber: verse.verse_number,
            },
            source: {
              provider: 'Quran Foundation Content API v4',
              translationResource: translation?.resource_name || `id:${translationId}`,
              tafsirResource:      tafsir?.resource_name      || `id:${tafsirId}`,
              audioResource:       audio ? `reciter:${reciterId}` : null,
              fallbackUsed: false,
            },
          });
        }
      } catch (err) {
        console.warn(`[content] live lesson hydration failed for ${ayahKey}: ${err.message}`);
        // fall through
      }
    }

    // --- Fallback: local dataset -----------------------------------------
    const v = getVerse(ayahKey);
    if (!v) return res.status(404).json({ error: 'Verse not found in local dataset' });
    const s = getSurah(chapterNum);
    return res.json({
      ayahKey,
      arabic: v.text_uthmani,
      translation: v.translation,
      tafsir: v.tafsir_simple || null,
      audioUrl: v.audio_url || null,
      chapter: s ? {
        number: s.id,
        name: s.name_simple,
        nameArabic: s.name_arabic,
        revelationPlace: s.revelation_place,
        versesCount: s.verses_count,
      } : { number: chapterNum, name: null },
      metadata: { verseNumber: ayahNum },
      source: {
        provider: v.source?.generatedWith === 'quran.ai'
          ? 'local-cache + quran.ai authoring'
          : 'local-cache',
        translationResource: v.source?.translationEdition || 'local',
        tafsirResource:      v.source?.tafsirSources?.join(', ') || 'local',
        audioResource:       v.audio_url ? 'everyayah-cdn' : null,
        fallbackUsed: true,
      },
    });
  } catch (err) { next(err); }
});

export default router;
