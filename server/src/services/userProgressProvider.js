// server/src/services/userProgressProvider.js
//
// Single internal interface for user-related features. The same routes can
// be backed by either the Quran Foundation User API (when configured) or
// the existing local/Firebase userStore — without route code knowing which.
//
// This is how the brief asks us to support User APIs while keeping the local
// fallback working. Switching providers is a config decision.

import qfUser from './quranFoundationUserApi.js';
import { getUser, updateUser, tickStreak } from './userStore.js';

// ---- LocalFallbackProvider ------------------------------------------------
const local = {
  name: 'local',
  configured: () => true,

  async users_me(userId, _req) {
    const u = await getUser(userId);
    return {
      id: u.id, character: u.character, xp: u.xp, hearts: u.hearts,
      streak: u.streak, badges: u.badges,
    };
  },

  async preferences_get(userId) {
    const u = await getUser(userId);
    return u.preferences || {
      translationId: process.env.QF_TRANSLATION_ID || '131',
      tafsirId:      process.env.QF_TAFSIR_ID      || '169',
      reciterId:     process.env.QF_RECITER_ID     || '7',
      mushafId:      5,
    };
  },
  async preferences_patch(userId, patch) {
    const u = await updateUser(userId, (u) => {
      u.preferences = { ...(u.preferences || {}), ...patch };
      return u;
    });
    return u.preferences;
  },

  async goals_list(userId) {
    const u = await getUser(userId);
    return u.goals || [];
  },
  async goals_set(userId, { type, target, unit }) {
    const u = await updateUser(userId, (u) => {
      u.goals = u.goals || [];
      const idx = u.goals.findIndex((g) => g.type === type);
      const entry = { type, target, unit, updatedAt: new Date().toISOString() };
      if (idx >= 0) u.goals[idx] = entry; else u.goals.push(entry);
      return u;
    });
    return u.goals;
  },

  async bookmarks_list(userId) {
    const u = await getUser(userId);
    // Normalize to the QF-style shape.
    return (u.bookmarks || []).map((vk) => {
      const [chapter, ayah] = String(vk).split(':').map(Number);
      return { id: vk, key: chapter, verseNumber: ayah, type: 'ayah', verseKey: vk };
    });
  },
  async bookmarks_add(userId, { chapterId, ayahNumber }) {
    const vk = `${chapterId}:${ayahNumber}`;
    await updateUser(userId, (u) => {
      if (!u.bookmarks.includes(vk)) u.bookmarks.push(vk);
      return u;
    });
    return { id: vk, key: chapterId, verseNumber: ayahNumber, type: 'ayah', verseKey: vk };
  },
  async bookmarks_remove(userId, id) {
    await updateUser(userId, (u) => {
      u.bookmarks = u.bookmarks.filter((vk) => vk !== id);
      return u;
    });
    return { success: true };
  },

  async notes_list(userId) {
    const u = await getUser(userId);
    return u.reflections || [];
  },
  async notes_add(userId, { ayahKey, body, tags = [] }) {
    const note = {
      id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ayahKey, body, tags,
      createdAt: new Date().toISOString(),
    };
    await updateUser(userId, (u) => {
      u.reflections = u.reflections || [];
      u.reflections.push(note);
      return u;
    });
    return note;
  },

  async readingSessions_start(userId, { ayahKey, durationSeconds }) {
    const session = {
      id: `rs_${Date.now()}`,
      ayahKey, durationSeconds, source: 'listen',
      createdAt: new Date().toISOString(),
    };
    await updateUser(userId, (u) => {
      u.readingSessions = u.readingSessions || [];
      u.readingSessions.push(session);
      // A listening session counts as "meaningful daily activity" for the
      // streak — per the brief's scoring rules.
      tickStreak(u);
      return u;
    });
    return session;
  },
  async readingSessions_list(userId) {
    const u = await getUser(userId);
    return u.readingSessions || [];
  },

  async activityDays_list(userId) {
    const u = await getUser(userId);
    // Build a synthetic activity-day list from local data.
    const days = new Set();
    for (const q of u.completedQuests || []) {
      days.add(String(q.completedAt).slice(0, 10));
    }
    for (const r of u.reflections || []) {
      days.add(String(r.createdAt || r.ts).slice(0, 10));
    }
    for (const s of u.readingSessions || []) {
      days.add(String(s.createdAt).slice(0, 10));
    }
    return [...days].sort().map((date) => ({ date }));
  },

  async streaks_get(userId) {
    const u = await getUser(userId);
    return u.streak;
  },

  async collections_list(userId) {
    const u = await getUser(userId);
    return u.collections || [];
  },
  async collections_create(userId, { name }) {
    const c = { id: `c_${Date.now()}`, name, items: [] };
    await updateUser(userId, (u) => {
      u.collections = u.collections || [];
      u.collections.push(c);
      return u;
    });
    return c;
  },

  async tags_list(userId) {
    const u = await getUser(userId);
    return u.tags || [];
  },
  async tags_create(userId, { name }) {
    const t = { id: `t_${Date.now()}`, name };
    await updateUser(userId, (u) => {
      u.tags = u.tags || [];
      if (!u.tags.some((x) => x.name === name)) u.tags.push(t);
      return u;
    });
    return t;
  },
};

// ---- QuranFoundationUserApiProvider ---------------------------------------
// Uses the session access token (from OAuth2 login) if present, then falls
// back to QF_USER_ACCESS_TOKEN env var (static dev token). Configured when
// QF_CLIENT_ID + QF_CLIENT_SECRET are set (OAuth2 is possible) or when a
// static token env var is present.
const qf = {
  name: 'quran-foundation',
  configured: () => qfUser.isConfigured() || Boolean(process.env.QF_USER_ACCESS_TOKEN),

  // Token from session (set by /api/auth/callback) or static env fallback.
  _token: (req) => req?.session?.qfAuth?.accessToken || process.env.QF_USER_ACCESS_TOKEN || null,

  users_me: (uid, req) => qfUser.users.me(qf._token(req)),
  preferences_get: (uid, req) => qfUser.preferences.get(qf._token(req)),
  preferences_patch: (uid, patch, req) => qfUser.preferences.patch(patch, qf._token(req)),
  goals_list: (uid, req) => qfUser.goals.list(qf._token(req)),
  goals_set: (uid, g, req) => qfUser.goals.set(g, qf._token(req)),
  bookmarks_list: (uid, req) => qfUser.bookmarks.list({}, qf._token(req)),
  bookmarks_add: (uid, b, req) => qfUser.bookmarks.add(b, qf._token(req)),
  bookmarks_remove: (uid, id, req) => qfUser.bookmarks.remove(id, qf._token(req)),
  notes_list: (uid, req) => qfUser.notes.list({}, qf._token(req)),
  notes_add: (uid, n, req) => qfUser.notes.add(n, qf._token(req)),
  readingSessions_start: (uid, r, req) => qfUser.readingSessions.start(r, qf._token(req)),
  readingSessions_list: (uid, req) => qfUser.readingSessions.list({}, qf._token(req)),
  activityDays_list: (uid, req) => qfUser.activityDays.list({}, qf._token(req)),
  streaks_get: (uid, req) => qfUser.streaks.get(qf._token(req)),
  collections_list: (uid, req) => qfUser.collections.list(qf._token(req)),
  collections_create: (uid, c, req) => qfUser.collections.create(c, qf._token(req)),
  tags_list: (uid, req) => qfUser.tags.list(qf._token(req)),
  tags_create: (uid, t, req) => qfUser.tags.create(t, qf._token(req)),
};

// ---- Picker ---------------------------------------------------------------
// Chooses QF provider when a session token is present (from OAuth2 login)
// OR when a static QF_USER_ACCESS_TOKEN env var is set. Otherwise local.
export function provider(req) {
  if (qf.configured()) {
    const hasToken = req?.session?.qfAuth?.accessToken || process.env.QF_USER_ACCESS_TOKEN;
    if (hasToken) return qf;
  }
  return local;
}

export function providerInfo(req) {
  const p = provider(req);
  return {
    active: p.name,
    qfConfigured: qf.configured(),
    hasSessionToken: Boolean(req?.session?.qfAuth?.accessToken),
    hasStaticToken: Boolean(process.env.QF_USER_ACCESS_TOKEN),
    authFlow: 'OAuth2 Authorization Code + PKCE via /api/auth/login',
    fallback: 'local',
  };
}

// Helpful for routes that want graceful degradation.
// fn receives (provider, req) so the QF provider can access the session token.
export async function withFallback(fn, req) {
  const p = provider(req);
  if (p.name === 'local') return fn(local, req);
  try {
    return await fn(p, req);
  } catch (err) {
    console.warn(`[userProvider] QF failed, falling back to local: ${err.message}`);
    return fn(local, req);
  }
}
