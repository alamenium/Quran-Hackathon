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
  // Upload raw audio (Blob) for AI transcription via the DeepSpeech-Quran
  // sidecar. Sends the bytes raw; the server reads them with express.raw.
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
};
