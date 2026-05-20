// server/src/services/quranFoundationUserApi.js
//
// Thin client for the Quran Foundation User-related APIs v1.0.0:
//   https://api-docs.quran.foundation/docs/user_related_apis_versioned/1.0.0/user-related-apis/
//
// These endpoints require a *user* access token (OAuth2 Authorization Code
// flow), not the client_credentials token used for the Content APIs. The
// user-side OAuth flow is out of scope for a hackathon demo, so this module
// is built to be ENABLED via env when a token is available and otherwise
// used through the LocalFallback provider in services/userProgressProvider.js.
//
// Auth headers per docs:
//   x-auth-token: <jwt access token>
//   x-client-id:  <client id>
//
// Endpoints documented under /auth/v1/... (e.g. /auth/v1/bookmarks, /notes,
// /goals, /preferences, /reading-sessions, /activity-days, /streaks,
// /collections, /tags). Pagination uses cursor params: first/after, last/before.

const PRELIVE = {
  api: process.env.QF_USER_API_BASE_URL ||
       'https://prelive-apis.quran.foundation/auth/v1',
};
const PRODUCTION = {
  api: process.env.QF_USER_API_BASE_URL ||
       'https://apis.quran.foundation/auth/v1',
};

function endpoints() {
  return process.env.QF_ENV === 'production' ? PRODUCTION : PRELIVE;
}

export function isConfigured() {
  return Boolean(
    process.env.QF_USER_ACCESS_TOKEN &&
    (process.env.QF_USER_CLIENT_ID || process.env.QF_CLIENT_ID)
  );
}

async function call(method, pathname, { params, body } = {}) {
  if (!isConfigured()) {
    const err = new Error('QF_USER_NOT_CONFIGURED');
    err.code = 'QF_USER_NOT_CONFIGURED';
    throw err;
  }
  const { api } = endpoints();
  const url = new URL(api + pathname);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, v);
      }
    }
  }
  const res = await fetch(url, {
    method,
    headers: {
      'x-auth-token': process.env.QF_USER_ACCESS_TOKEN,
      'x-client-id':
        process.env.QF_USER_CLIENT_ID || process.env.QF_CLIENT_ID,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`QF User API ${res.status}: ${text}`);
    err.status = res.status;
    throw err;
  }
  // Docs return { success, data } envelope.
  return res.json();
}

// --- Bookmarks --------------------------------------------------------------
//   GET    /bookmarks
//   POST   /bookmarks
//   DELETE /bookmarks/{id}
export const bookmarks = {
  list: (params = {}) =>
    call('GET', '/bookmarks', {
      params: { mushafId: params.mushafId || 5, type: params.type || 'ayah', ...params },
    }),
  // POST body per docs: { type, mushafId, key (surah), verseNumber }
  add: ({ chapterId, ayahNumber, mushafId = 5 }) =>
    call('POST', '/bookmarks', {
      body: { type: 'ayah', mushafId, key: chapterId, verseNumber: ayahNumber },
    }),
  remove: (id) => call('DELETE', `/bookmarks/${id}`),
};

// --- Notes (reflections) ----------------------------------------------------
//   GET    /notes
//   POST   /notes
//   PATCH  /notes/{id}
//   DELETE /notes/{id}
export const notes = {
  list: (params = {}) => call('GET', '/notes', { params }),
  add: ({ ayahKey, body, tags = [] }) =>
    call('POST', '/notes', { body: { key: ayahKey, body, tags } }),
  update: (id, patch) => call('PATCH', `/notes/${id}`, { body: patch }),
  remove: (id) => call('DELETE', `/notes/${id}`),
};

// --- Goals ------------------------------------------------------------------
//   GET  /goals
//   POST /goals
export const goals = {
  list: () => call('GET', '/goals'),
  set: ({ type, target, unit }) =>
    call('POST', '/goals', { body: { type, target, unit } }),
};

// --- Reading Sessions -------------------------------------------------------
// Track listen/follow (NOT used to replace recitation verification).
//   GET  /reading-sessions
//   POST /reading-sessions
export const readingSessions = {
  list: (params = {}) => call('GET', '/reading-sessions', { params }),
  start: ({ ayahKey, durationSeconds, source = 'listen' }) =>
    call('POST', '/reading-sessions', {
      body: { ayah_key: ayahKey, duration_seconds: durationSeconds, source },
    }),
};

// --- Activity Days ----------------------------------------------------------
//   GET /activity-days
export const activityDays = {
  list: (params = {}) => call('GET', '/activity-days', { params }),
};

// --- Streaks ----------------------------------------------------------------
//   GET /streaks
export const streaks = {
  get: () => call('GET', '/streaks'),
};

// --- Collections ------------------------------------------------------------
//   GET  /collections
//   POST /collections
export const collections = {
  list: () => call('GET', '/collections'),
  create: ({ name }) => call('POST', '/collections', { body: { name } }),
  addBookmark: (collectionId, { chapterId, ayahNumber, mushafId = 5 }) =>
    call('POST', `/collections/${collectionId}/bookmarks`, {
      body: { type: 'ayah', mushafId, key: chapterId, verseNumber: ayahNumber },
    }),
};

// --- Tags -------------------------------------------------------------------
//   GET  /tags
//   POST /tags
export const tags = {
  list: () => call('GET', '/tags'),
  create: ({ name }) => call('POST', '/tags', { body: { name } }),
};

// --- Preferences ------------------------------------------------------------
//   GET /preferences
//   PATCH /preferences
export const preferences = {
  get: () => call('GET', '/preferences'),
  patch: (patch) => call('PATCH', '/preferences', { body: patch }),
};

// --- Users ------------------------------------------------------------------
//   GET /users/me
export const users = {
  me: () => call('GET', '/users/me'),
};

export default {
  isConfigured,
  bookmarks, notes, goals, readingSessions, activityDays, streaks,
  collections, tags, preferences, users,
};
