// Thin fetch wrapper. The Vite dev server proxies /api → backend, and in
// production the backend serves the built client, so a relative URL Just Works
// in both environments. VITE_API_URL is supported for cross-origin deploys.

const BASE = import.meta.env.VITE_API_URL || '';

function userId() {
  let id = localStorage.getItem('aq_user_id');
  if (!id) {
    id = 'user_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem('aq_user_id', id);
  }
  return id;
}

async function request(path, opts = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': userId(),
    ...(opts.headers || {}),
  };
  const res = await fetch(BASE + path, { ...opts, headers });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      msg = data.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  userId,
  health: () => request('/api/health'),
  // Quran
  surahs: () => request('/api/quran/surahs'),
  surah: (id) => request(`/api/quran/surahs/${id}`),
  verse: (key) => request(`/api/quran/verse/${encodeURIComponent(key)}`),
  words: (theme) => request(`/api/quran/words${theme ? `?theme=${theme}` : ''}`),
  source: () => request('/api/quran/source'),
  // Quests
  roadmap: () => request('/api/quests/roadmap'),
  daily: () => request('/api/quests/daily'),
  quest: (id) => request(`/api/quests/${id}`),
  sourceManifest: () => request('/api/quests/source-manifest'),
  // Diagnostic
  diagnostic: () => request('/api/diagnostic'),
  scoreDiagnostic: (answers) =>
    request('/api/diagnostic/score', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
  // Recitation
  verifyRecitation: (verseKey, transcript) =>
    request('/api/recitation/verify', {
      method: 'POST',
      body: JSON.stringify({ verseKey, transcript }),
    }),
  // Upload raw audio (Blob) for AI transcription via the faster-whisper
  // sidecar. Sends the bytes raw; the server reads them with express.raw,
  // forwards to the Python service, and returns the scored result.
  verifyRecitationAudio: async (verseKey, audioBlob) => {
    const url = (import.meta.env.VITE_API_URL || '') + '/api/recitation/verify-audio';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': audioBlob.type || 'audio/webm',
        'X-Verse-Key': verseKey,
        'x-user-id': userId(),
      },
      body: audioBlob,
    });
    if (!res.ok) {
      let msg = `Audio request failed (${res.status})`;
      try {
        const data = await res.json();
        msg = data.error || msg;
      } catch {}
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return res.json();
  },
  asrStatus: () => request('/api/recitation/asr-status'),
  // AI tutor
  aiStatus: () => request('/api/ai/status'),
  tutorAsk: (userMessage, conversationHistory, lessonContext) =>
    request('/api/ai/tutor', {
      method: 'POST',
      body: JSON.stringify({ userMessage, conversationHistory, lessonContext }),
    }),
  lessonSummary: (payload) =>
    request('/api/ai/lesson-summary', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  simplifyTafsir: (payload) =>
    request('/api/ai/simplify-tafsir', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  // Progress
  progress: () => request('/api/progress'),
  setCharacter: (character) =>
    request('/api/progress/character', {
      method: 'POST',
      body: JSON.stringify({ character }),
    }),
  setPlacement: (payload) =>
    request('/api/progress/placement', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  completeQuest: (payload) =>
    request('/api/progress/quest-complete', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  toggleBookmark: (verseKey) =>
    request('/api/progress/bookmark', {
      method: 'POST',
      body: JSON.stringify({ verseKey }),
    }),
  toggleSavedWord: (wordId) =>
    request('/api/progress/save-word', {
      method: 'POST',
      body: JSON.stringify({ wordId }),
    }),
  clearMistake: (questionId, ts) =>
    request('/api/progress/clear-mistake', {
      method: 'POST',
      body: JSON.stringify({ questionId, ts }),
    }),
  // Stories
  stories: () => request('/api/stories'),
  story: (id) => request(`/api/stories/${id}`),
  // Classes (recitation)
  classes: () => request('/api/classes'),
  class: (id) => request(`/api/classes/${encodeURIComponent(id)}`),
  // Quran Compass missions
  compassMissions: () => request('/api/compass'),
  compassMission: (id) => request(`/api/compass/${encodeURIComponent(id)}`),

  // --- Quran Foundation Content API ---------------------------------------
  // Wrappers for /api/content/* (lesson hydration, chapters, audio, etc.)
  content: {
    status: () => request('/api/content/status'),
    resources: () => request('/api/content/resources'),
    chapters: () => request('/api/content/chapters'),
    lesson: (ayahKey, opts = {}) => {
      const qs = new URLSearchParams();
      if (opts.translationId) qs.set('translationId', opts.translationId);
      if (opts.tafsirId) qs.set('tafsirId', opts.tafsirId);
      if (opts.reciterId) qs.set('reciterId', opts.reciterId);
      const tail = qs.toString() ? `?${qs}` : '';
      return request(`/api/content/lesson/${encodeURIComponent(ayahKey)}${tail}`);
    },
    audio: (ayahKey) => request(`/api/content/audio/${encodeURIComponent(ayahKey)}`),
    page: (n) => request(`/api/content/page/${n}`),
    juz: (n) => request(`/api/content/juz/${n}`),
  },

  // --- Quran Foundation User API (with local fallback) --------------------
  // Wrappers for /api/user/* — same shape regardless of which provider is
  // active server-side. See server/src/services/userProgressProvider.js.
  user: {
    status: () => request('/api/user/status'),
    me: () => request('/api/user/me'),
    preferences: () => request('/api/user/preferences'),
    setPreferences: (patch) =>
      request('/api/user/preferences', { method: 'POST', body: JSON.stringify(patch) }),
    goals: () => request('/api/user/goals'),
    setGoal: ({ type, target, unit }) =>
      request('/api/user/goals', {
        method: 'POST',
        body: JSON.stringify({ type, target, unit }),
      }),
    bookmarks: () => request('/api/user/bookmarks'),
    addBookmark: ({ ayahKey, chapterId, ayahNumber }) =>
      request('/api/user/bookmarks', {
        method: 'POST',
        body: JSON.stringify({ ayahKey, chapterId, ayahNumber }),
      }),
    removeBookmark: (id) =>
      request(`/api/user/bookmarks/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    notes: () => request('/api/user/notes'),
    addNote: ({ ayahKey, body, tags }) =>
      request('/api/user/notes', {
        method: 'POST',
        body: JSON.stringify({ ayahKey, body, tags }),
      }),
    startReadingSession: ({ ayahKey, durationSeconds }) =>
      request('/api/user/reading-sessions', {
        method: 'POST',
        body: JSON.stringify({ ayahKey, durationSeconds }),
      }),
    activityDays: () => request('/api/user/activity-days'),
    streaks: () => request('/api/user/streaks'),
    collections: () => request('/api/user/collections'),
    createCollection: (name) =>
      request('/api/user/collections', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    tags: () => request('/api/user/tags'),
    createTag: (name) =>
      request('/api/user/tags', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
  },
};
