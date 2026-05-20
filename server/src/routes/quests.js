// /api/quests/* — curriculum and quest delivery.

import { Router } from 'express';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SECTIONS, pickDailyQuest, findQuest } from '../data/curriculum.js';
import { getVerse } from '../data/quranContent.js';

const router = Router();

// Source manifest — lists every quran.ai tool call backing the content pack.
// Loaded once at startup; small JSON, no perf concern.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let QURAN_AI_MANIFEST = null;
try {
  QURAN_AI_MANIFEST = JSON.parse(
    readFileSync(path.resolve(__dirname, '../data/quranAiSourceManifest.json'), 'utf8')
  );
} catch (err) {
  console.warn('[quests] quranAiSourceManifest.json not loaded:', err.message);
}

// GET /api/quests/source-manifest — proof that quran.ai-powered content
// is source-grounded. Useful for the demo card / judges.
router.get('/source-manifest', (_req, res) => {
  if (!QURAN_AI_MANIFEST) {
    return res.status(503).json({ error: 'Source manifest not available' });
  }
  res.json(QURAN_AI_MANIFEST);
});

// GET /api/quests/roadmap — full curriculum tree (sections → units → quests)
router.get('/roadmap', (_req, res) => {
  // Strip the heavy `questions` array from listing for a smaller payload.
  const lean = SECTIONS.map((sec) => ({
    ...sec,
    units: sec.units.map((u) => ({
      ...u,
      quests: u.quests.map((q) => ({
        id: q.id,
        order: q.order,
        title: q.title,
        xp: q.xp,
        theme: q.theme,
        verses: q.verses,
        questionCount: q.questions.length,
      })),
    })),
  }));
  res.json({ sections: lean });
});

// GET /api/quests/daily — today's recommended quest
router.get('/daily', (_req, res) => {
  const ctx = pickDailyQuest();
  res.json({
    sectionId: ctx.section.id,
    unitId: ctx.unit.id,
    quest: hydrateQuest(ctx.quest),
  });
});

// GET /api/quests/:id — full quest with hydrated verses.
// We also surface the parent section's themed metadata (theme + compass)
// so the client can render the right header without an extra round-trip.
router.get('/:id', (req, res) => {
  const ctx = findQuest(req.params.id);
  if (!ctx) return res.status(404).json({ error: 'Quest not found' });
  res.json({
    sectionId: ctx.section.id,
    unitId: ctx.unit.id,
    sectionMeta: {
      title: ctx.section.title,
      theme: ctx.section.theme || null,
      world: ctx.section.world || null,
      color: ctx.section.color || null,
      compass: ctx.section.compass || null,
    },
    quest: hydrateQuest(ctx.quest),
  });
});

// Resolve verse_key references inside questions to the full verse object.
function hydrateQuest(quest) {
  const verses = (quest.verses || [])
    .map((vk) => getVerse(vk))
    .filter(Boolean);
  // Resolve related_ayahs to full verses (used by the "Explore More" UI).
  const related_ayahs = (quest.related_ayahs || [])
    .map((r) => {
      const verse = getVerse(r.verse_key);
      return verse ? { ...r, verse } : null;
    })
    .filter(Boolean);
  const questions = quest.questions.map((q) => {
    const out = { ...q };
    if (q.audio_verse_key) {
      out.audio = getVerse(q.audio_verse_key);
    }
    if (q.verse_key) {
      out.verse = getVerse(q.verse_key);
    }
    if (q.options && Array.isArray(q.options)) {
      out.options = q.options.map((opt) => {
        if (opt && typeof opt === 'object' && opt.verse_key) {
          return { ...opt, verse: getVerse(opt.verse_key) };
        }
        return opt;
      });
    }
    if (Array.isArray(q.items)) {
      out.items = q.items.map((it) =>
        it.verse_key ? { ...it, verse: getVerse(it.verse_key) } : it
      );
    }
    return out;
  });
  return { ...quest, verses, related_ayahs, questions };
}

export default router;
