// /api/quests/* — curriculum and quest delivery.

import { Router } from 'express';
import { SECTIONS, pickDailyQuest, findQuest } from '../data/curriculum.js';
import { getVerse } from '../data/quranContent.js';

const router = Router();

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

// GET /api/quests/:id — full quest with hydrated verses
router.get('/:id', (req, res) => {
  const ctx = findQuest(req.params.id);
  if (!ctx) return res.status(404).json({ error: 'Quest not found' });
  res.json({
    sectionId: ctx.section.id,
    unitId: ctx.unit.id,
    quest: hydrateQuest(ctx.quest),
  });
});

// Resolve verse_key references inside questions to the full verse object.
function hydrateQuest(quest) {
  const verses = (quest.verses || [])
    .map((vk) => getVerse(vk))
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
  return { ...quest, verses, questions };
}

export default router;
