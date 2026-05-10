// /api/progress/* — user XP, streaks, mistakes, bookmarks, reflections.

import { Router } from 'express';
import { getUser, updateUser, tickStreak } from '../services/userStore.js';
import { findQuest } from '../data/curriculum.js';

const router = Router();

// Identify users by an opaque clientId stored in localStorage. No PII, no auth
// required for the MVP — perfect for a hackathon demo. Add real auth later.
function userId(req) {
  const id = req.header('x-user-id') || req.body?.userId || req.query.userId;
  return id || 'anon';
}

// GET /api/progress — full user state
router.get('/', async (req, res, next) => {
  try {
    const user = await getUser(userId(req));
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// POST /api/progress/character — set the chosen character
router.post('/character', async (req, res, next) => {
  try {
    const user = await updateUser(userId(req), (u) => {
      u.character = req.body.character || 'boy1';
      return u;
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// POST /api/progress/placement — store diagnostic outcome
router.post('/placement', async (req, res, next) => {
  try {
    const { sectionId, level, scorePct } = req.body;
    const user = await updateUser(userId(req), (u) => {
      u.placement = { sectionId, level, scorePct, ts: new Date().toISOString() };
      return u;
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// POST /api/progress/quest-complete — mark a quest as completed
router.post('/quest-complete', async (req, res, next) => {
  try {
    const { questId, score, mistakes = [], reflections = [] } = req.body;
    const ctx = findQuest(questId);
    if (!ctx) return res.status(404).json({ error: 'Quest not found' });

    const user = await updateUser(userId(req), (u) => {
      // XP
      u.xp += ctx.quest.xp || 10;
      // completed list
      const existing = u.completedQuests.find((q) => q.questId === questId);
      const record = {
        questId,
        completedAt: new Date().toISOString(),
        score: typeof score === 'number' ? score : 100,
      };
      if (existing) Object.assign(existing, record);
      else u.completedQuests.push(record);
      // mistakes go into the review queue
      for (const m of mistakes) {
        u.mistakes.push({ ...m, questId, ts: new Date().toISOString() });
      }
      // reflections
      for (const r of reflections) {
        u.reflections.push({ ...r, questId, ts: new Date().toISOString() });
      }
      // streak
      tickStreak(u);
      // badges (simple rules)
      const bset = new Set(u.badges);
      if (u.completedQuests.length >= 1) bset.add('first_quest');
      if (u.completedQuests.length >= 5) bset.add('quest_explorer');
      if (u.streak.current >= 3) bset.add('three_day_streak');
      if (u.streak.current >= 7) bset.add('week_with_quran');
      if (u.xp >= 100) bset.add('xp_100');
      if (u.savedWords.length >= 5) bset.add('word_collector');
      u.badges = [...bset];
      return u;
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// POST /api/progress/bookmark — toggle bookmark for a verse
router.post('/bookmark', async (req, res, next) => {
  try {
    const { verseKey } = req.body;
    const user = await updateUser(userId(req), (u) => {
      const idx = u.bookmarks.indexOf(verseKey);
      if (idx >= 0) u.bookmarks.splice(idx, 1);
      else u.bookmarks.push(verseKey);
      return u;
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// POST /api/progress/save-word — toggle word in toolkit
router.post('/save-word', async (req, res, next) => {
  try {
    const { wordId } = req.body;
    const user = await updateUser(userId(req), (u) => {
      const idx = u.savedWords.indexOf(wordId);
      if (idx >= 0) u.savedWords.splice(idx, 1);
      else u.savedWords.push(wordId);
      return u;
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// POST /api/progress/clear-mistake — remove a fixed mistake from the review queue
router.post('/clear-mistake', async (req, res, next) => {
  try {
    const { questionId, ts } = req.body;
    const user = await updateUser(userId(req), (u) => {
      u.mistakes = u.mistakes.filter(
        (m) => !(m.questionId === questionId && m.ts === ts)
      );
      return u;
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
