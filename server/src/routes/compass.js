// /api/compass/* — Quran Compass missions.
//
//   GET  /api/compass        → mission list (lean — no lenses)
//   GET  /api/compass/:id    → full mission (opening, all 6 lenses, closing,
//                              card). Verses referenced inside lenses are
//                              hydrated from the offline Quran content.

import { Router } from 'express';
import { listMissions, findMission } from '../data/compassMissions.js';
import { getVerse } from '../data/quranContent.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ missions: listMissions() });
});

router.get('/:id', (req, res) => {
  const m = findMission(req.params.id);
  if (!m) return res.status(404).json({ error: 'Mission not found' });

  // Hydrate any verseKey references in lenses with the actual Quran text.
  const lenses = m.lenses.map((lens) => {
    if (lens.verseKey) {
      const verse = getVerse(lens.verseKey);
      return verse ? { ...lens, verse } : lens;
    }
    return lens;
  });

  res.json({ ...m, lenses });
});

export default router;
