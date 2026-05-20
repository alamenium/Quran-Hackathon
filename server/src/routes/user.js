// server/src/routes/user.js
//
// /api/user/* — Quran Foundation User-related APIs surface, backed by either
// the QF User API (when QF_USER_ACCESS_TOKEN is set) or the local fallback
// provider. Same shape for the client either way.
//
// The brief asks for these routes specifically:
//   GET  /api/user/me
//   GET  /api/user/preferences
//   POST /api/user/preferences
//   GET  /api/user/goals
//   POST /api/user/goals
//   POST /api/user/bookmarks
//   GET  /api/user/bookmarks
//   POST /api/user/notes
//   GET  /api/user/notes
//   POST /api/user/reading-sessions
//   GET  /api/user/activity-days
//   GET  /api/user/streaks
//   POST /api/user/collections
//   GET  /api/user/collections
//   POST /api/user/tags
//   GET  /api/user/tags
//
// Note: Reading Sessions track LISTEN/FOLLOW activity only. They do not
// replace the existing recitation verification flow at /api/recitation/*.

import { Router } from 'express';
import { provider, providerInfo, withFallback } from '../services/userProgressProvider.js';

const router = Router();

function userId(req) {
  return req.header('x-user-id') || req.body?.userId || req.query.userId || 'anon';
}

// Provider status — useful for debugging and judging.
router.get('/status', (_req, res) => res.json(providerInfo()));

// GET /api/user/me
router.get('/me', async (req, res, next) => {
  try {
    const uid = userId(req);
    const data = await withFallback((p) => p.users_me(uid));
    res.json({ user: data });
  } catch (err) { next(err); }
});

// GET/POST /api/user/preferences
router.get('/preferences', async (req, res, next) => {
  try {
    const uid = userId(req);
    res.json({ preferences: await withFallback((p) => p.preferences_get(uid)) });
  } catch (err) { next(err); }
});
router.post('/preferences', async (req, res, next) => {
  try {
    const uid = userId(req);
    res.json({ preferences: await withFallback((p) => p.preferences_patch(uid, req.body)) });
  } catch (err) { next(err); }
});

// GET/POST /api/user/goals
router.get('/goals', async (req, res, next) => {
  try {
    const uid = userId(req);
    res.json({ goals: await withFallback((p) => p.goals_list(uid)) });
  } catch (err) { next(err); }
});
router.post('/goals', async (req, res, next) => {
  try {
    const uid = userId(req);
    const { type, target, unit } = req.body || {};
    if (!type) return res.status(400).json({ error: 'type required' });
    res.json({
      goals: await withFallback((p) => p.goals_set(uid, { type, target, unit })),
    });
  } catch (err) { next(err); }
});

// GET/POST /api/user/bookmarks
router.get('/bookmarks', async (req, res, next) => {
  try {
    const uid = userId(req);
    res.json({ bookmarks: await withFallback((p) => p.bookmarks_list(uid)) });
  } catch (err) { next(err); }
});
router.post('/bookmarks', async (req, res, next) => {
  try {
    const uid = userId(req);
    const { ayahKey, chapterId, ayahNumber } = req.body || {};
    let c = chapterId, a = ayahNumber;
    if (ayahKey && !c && !a) {
      const parts = String(ayahKey).split(':').map(Number);
      c = parts[0]; a = parts[1];
    }
    if (!c || !a) return res.status(400).json({ error: 'ayahKey or chapterId+ayahNumber required' });
    const bookmark = await withFallback((p) => p.bookmarks_add(uid, { chapterId: c, ayahNumber: a }));
    res.json({ bookmark });
  } catch (err) { next(err); }
});
router.delete('/bookmarks/:id', async (req, res, next) => {
  try {
    const uid = userId(req);
    res.json(await withFallback((p) => p.bookmarks_remove(uid, req.params.id)));
  } catch (err) { next(err); }
});

// GET/POST /api/user/notes
router.get('/notes', async (req, res, next) => {
  try {
    const uid = userId(req);
    res.json({ notes: await withFallback((p) => p.notes_list(uid)) });
  } catch (err) { next(err); }
});
router.post('/notes', async (req, res, next) => {
  try {
    const uid = userId(req);
    const { ayahKey, body, tags = [] } = req.body || {};
    if (!body) return res.status(400).json({ error: 'body required' });
    const note = await withFallback((p) => p.notes_add(uid, { ayahKey, body, tags }));
    res.json({ note });
  } catch (err) { next(err); }
});

// POST /api/user/reading-sessions
router.post('/reading-sessions', async (req, res, next) => {
  try {
    const uid = userId(req);
    const { ayahKey, durationSeconds = 0 } = req.body || {};
    const session = await withFallback((p) =>
      p.readingSessions_start(uid, { ayahKey, durationSeconds })
    );
    res.json({ session });
  } catch (err) { next(err); }
});
router.get('/reading-sessions', async (req, res, next) => {
  try {
    const uid = userId(req);
    res.json({ sessions: await withFallback((p) => p.readingSessions_list(uid)) });
  } catch (err) { next(err); }
});

// GET /api/user/activity-days
router.get('/activity-days', async (req, res, next) => {
  try {
    const uid = userId(req);
    res.json({ days: await withFallback((p) => p.activityDays_list(uid)) });
  } catch (err) { next(err); }
});

// GET /api/user/streaks
router.get('/streaks', async (req, res, next) => {
  try {
    const uid = userId(req);
    res.json({ streak: await withFallback((p) => p.streaks_get(uid)) });
  } catch (err) { next(err); }
});

// GET/POST /api/user/collections
router.get('/collections', async (req, res, next) => {
  try {
    const uid = userId(req);
    res.json({ collections: await withFallback((p) => p.collections_list(uid)) });
  } catch (err) { next(err); }
});
router.post('/collections', async (req, res, next) => {
  try {
    const uid = userId(req);
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name required' });
    res.json({ collection: await withFallback((p) => p.collections_create(uid, { name })) });
  } catch (err) { next(err); }
});

// GET/POST /api/user/tags
router.get('/tags', async (req, res, next) => {
  try {
    const uid = userId(req);
    res.json({ tags: await withFallback((p) => p.tags_list(uid)) });
  } catch (err) { next(err); }
});
router.post('/tags', async (req, res, next) => {
  try {
    const uid = userId(req);
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name required' });
    res.json({ tag: await withFallback((p) => p.tags_create(uid, { name })) });
  } catch (err) { next(err); }
});

export default router;
