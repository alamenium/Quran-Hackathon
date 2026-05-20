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
    process.env.QF_CLIENT_ID &&
    process.env.QF_CLIENT_SECRET
  );
}

// sessionToken: access token from the user's OAuth2 session (preferred).
// Falls back to QF_USER_ACCESS_TOKEN env var for static/dev tokens.
async function call(method, pathname, { params, body, sessionToken } = {}) {
  const token = sessionToken || process.env.QF_USER_ACCESS_TOKEN;
  const clientId = process.env.QF_USER_CLIENT_ID || process.env.QF_CLIENT_ID;

  if (!token || !clientId) {
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
      'x-auth-token': token,
      'x-client-id': clientId,
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
export const bookmarks = {
  list: (params = {}, sessionToken) =>
    call('GET', '/bookmarks', {
      params: { mushafId: params.mushafId || 5, type: params.type || 'ayah', ...params },
      sessionToken,
    }),
  add: ({ chapterId, ayahNumber, mushafId = 5 }, sessionToken) =>
    call('POST', '/bookmarks', {
      body: { type: 'ayah', mushafId, key: chapterId, verseNumber: ayahNumber },
      sessionToken,
    }),
  remove: (id, sessionToken) => call('DELETE', `/bookmarks/${id}`, { sessionToken }),
};

// --- Notes ------------------------------------------------------------------
export const notes = {
  list: (params = {}, sessionToken) => call('GET', '/notes', { params, sessionToken }),
  add: ({ ayahKey, body, tags = [] }, sessionToken) =>
    call('POST', '/notes', { body: { key: ayahKey, body, tags }, sessionToken }),
  update: (id, patch, sessionToken) => call('PATCH', `/notes/${id}`, { body: patch, sessionToken }),
  remove: (id, sessionToken) => call('DELETE', `/notes/${id}`, { sessionToken }),
};

// --- Goals ------------------------------------------------------------------
export const goals = {
  list: (sessionToken) => call('GET', '/goals', { sessionToken }),
  set: ({ type, target, unit }, sessionToken) =>
    call('POST', '/goals', { body: { type, target, unit }, sessionToken }),
};

// --- Reading Sessions -------------------------------------------------------
export const readingSessions = {
  list: (params = {}, sessionToken) => call('GET', '/reading-sessions', { params, sessionToken }),
  start: ({ ayahKey, durationSeconds, source = 'listen' }, sessionToken) =>
    call('POST', '/reading-sessions', {
      body: { ayah_key: ayahKey, duration_seconds: durationSeconds, source },
      sessionToken,
    }),
};

// --- Activity Days ----------------------------------------------------------
export const activityDays = {
  list: (params = {}, sessionToken) => call('GET', '/activity-days', { params, sessionToken }),
};

// --- Streaks ----------------------------------------------------------------
export const streaks = {
  get: (sessionToken) => call('GET', '/streaks', { sessionToken }),
};

// --- Collections ------------------------------------------------------------
export const collections = {
  list: (sessionToken) => call('GET', '/collections', { sessionToken }),
  create: ({ name }, sessionToken) => call('POST', '/collections', { body: { name }, sessionToken }),
  addBookmark: (collectionId, { chapterId, ayahNumber, mushafId = 5 }, sessionToken) =>
    call('POST', `/collections/${collectionId}/bookmarks`, {
      body: { type: 'ayah', mushafId, key: chapterId, verseNumber: ayahNumber },
      sessionToken,
    }),
};

// --- Tags -------------------------------------------------------------------
export const tags = {
  list: (sessionToken) => call('GET', '/tags', { sessionToken }),
  create: ({ name }, sessionToken) => call('POST', '/tags', { body: { name }, sessionToken }),
};

// --- Preferences ------------------------------------------------------------
export const preferences = {
  get: (sessionToken) => call('GET', '/preferences', { sessionToken }),
  patch: (patch, sessionToken) => call('PATCH', '/preferences', { body: patch, sessionToken }),
};

// --- Users ------------------------------------------------------------------
export const users = {
  me: (sessionToken) => call('GET', '/users/me', { sessionToken }),
};

export default {
  isConfigured,
  bookmarks, notes, goals, readingSessions, activityDays, streaks,
  collections, tags, preferences, users,
};
