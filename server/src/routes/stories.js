// /api/stories/* — Quranic storybook library.

import { Router } from 'express';
import { STORIES, getStory } from '../data/stories.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    stories: STORIES.map((s) => ({
      id: s.id,
      title: s.title,
      summary: s.summary,
      surah_reference: s.surah_reference,
      cover_emotion: s.cover_emotion,
      pageCount: s.pages.length,
    })),
  });
});

router.get('/:id', (req, res) => {
  const story = getStory(req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });
  res.json({ story });
});

export default router;
