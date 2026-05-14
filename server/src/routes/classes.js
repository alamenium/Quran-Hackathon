// /api/classes/* — recitation classes.
//
//   GET  /api/classes        → list (lean: no verse text)
//   GET  /api/classes/:id    → full class with hydrated verses
//
// A "class" is a themed bundle of ayat the user practises reciting in order,
// scored by the same recitation pipeline used by the `recite` question type.

import { Router } from 'express';
import { listClasses, findClass } from '../data/classes.js';
import { getVerse } from '../data/quranContent.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ classes: listClasses() });
});

router.get('/:id', (req, res) => {
  const klass = findClass(req.params.id);
  if (!klass) return res.status(404).json({ error: 'Class not found' });

  // Hydrate verses; warn (and skip) if any verse_key is missing from the
  // offline dataset so the client still gets a usable payload.
  const hydrated = [];
  const missing = [];
  for (const key of klass.verses) {
    const v = getVerse(key);
    if (v) hydrated.push(v);
    else missing.push(key);
  }
  if (missing.length) {
    console.warn(
      `[classes] class "${klass.id}" references unknown verses:`,
      missing.join(', ')
    );
  }

  res.json({
    id: klass.id,
    title: klass.title,
    subtitle: klass.subtitle,
    description: klass.description,
    level: klass.level,
    emoji: klass.emoji,
    color: klass.color,
    xp: klass.xp,
    verses: hydrated,
  });
});

export default router;
