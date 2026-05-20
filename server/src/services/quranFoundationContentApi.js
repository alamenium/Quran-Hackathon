// server/src/services/quranFoundationContentApi.js
//
// Thin, documented wrapper on top of services/quranApi.js for the Quran
// Foundation Content APIs v4.0.0. The underlying quranApi.js handles the
// OAuth2 client_credentials grant + token cache + x-auth-token / x-client-id
// headers exactly as the official docs prescribe:
//   https://api-docs.quran.foundation/docs/content_apis_versioned/4.0.0/content-apis/
//
// This file deliberately keeps the *named endpoints* close to the docs so a
// reader can map the wrapper directly back to the spec.
//
// Defaults:
//   - Translation 131 = Dr. Mustafa Khattab — The Clear Quran (common ID)
//   - Tafsir      169 = Tafsir Ibn Kathir (abridged)
//   - Reciter     7   = Mishary Rashid Alafasy
//   These IDs are exposed as env vars so they can be tuned without code edits.
//
// If quranApi is not configured (no QF_CLIENT_ID / QF_CLIENT_SECRET), the
// wrappers throw QF_NOT_CONFIGURED and callers fall back to the local
// quranContent.js dataset. Demo stays runnable.

import { quranApi } from './quranApi.js';

export const QF_DEFAULTS = {
  translationId: process.env.QF_TRANSLATION_ID || '131',
  tafsirId:      process.env.QF_TAFSIR_ID      || '169',
  reciterId:     process.env.QF_RECITER_ID     || '7',
  // Mushaf 5 (KFGQPC Hafs) is the safest indo-arab text choice for kids.
  mushafId:      process.env.QF_MUSHAF_ID      || '5',
};

export function isConfigured() {
  return quranApi.isConfigured();
}

// Resources -----------------------------------------------------------------
//   GET /resources/translations
//   GET /resources/tafsirs
//   GET /resources/recitations
export async function listTranslations(language = 'en') {
  const data = await quranApi.callApi('/resources/translations', { language });
  return data.translations || [];
}
export async function listTafsirs(language = 'en') {
  const data = await quranApi.callApi('/resources/tafsirs', { language });
  return data.tafsirs || [];
}
export async function listRecitations(language = 'en') {
  const data = await quranApi.callApi('/resources/recitations', { language });
  return data.recitations || [];
}

// Chapters -------------------------------------------------------------------
//   GET /chapters
//   GET /chapters/:id
export async function listChapters(language = 'en') {
  const data = await quranApi.callApi('/chapters', { language });
  return data.chapters || [];
}
export async function getChapter(id, language = 'en') {
  const data = await quranApi.callApi(`/chapters/${id}`, { language });
  return data.chapter || null;
}

// Verses ---------------------------------------------------------------------
//   GET /verses/by_key/:verse_key
//   GET /verses/by_chapter/:chapter_number
//   GET /verses/by_page/:page
//   GET /verses/by_juz/:juz
export async function getVerseByKey(verseKey, {
  translations = QF_DEFAULTS.translationId,
  tafsirs = QF_DEFAULTS.tafsirId,
  fields = 'text_uthmani,text_imlaei,chapter_id,verse_number,page_number,juz_number',
  language = 'en',
} = {}) {
  const data = await quranApi.callApi(`/verses/by_key/${verseKey}`, {
    translations,
    tafsirs,
    fields,
    language,
    word_fields: 'text_uthmani,transliteration',
  });
  return data.verse || null;
}

export async function getVersesByPage(pageNumber, opts = {}) {
  const data = await quranApi.callApi(`/verses/by_page/${pageNumber}`, {
    translations: opts.translations || QF_DEFAULTS.translationId,
    fields: opts.fields || 'text_uthmani',
    language: opts.language || 'en',
  });
  return data;
}
export async function getVersesByJuz(juzNumber, opts = {}) {
  const data = await quranApi.callApi(`/verses/by_juz/${juzNumber}`, {
    translations: opts.translations || QF_DEFAULTS.translationId,
    fields: opts.fields || 'text_uthmani',
    language: opts.language || 'en',
  });
  return data;
}

// Audio ----------------------------------------------------------------------
//   GET /recitations/:id/by_ayah/:verse_key
//   GET /chapter_recitations/:reciter_id/:chapter_number
export async function getAyahAudio(verseKey, reciterId = QF_DEFAULTS.reciterId) {
  // /recitations/{id}/by_ayah/{verse_key} returns timing + audio URL.
  const data = await quranApi.callApi(
    `/recitations/${reciterId}/by_ayah/${verseKey}`
  );
  // Response shape: { audio_files: [{ url, verse_key, segments, ... }] } or similar.
  const file = (data.audio_files && data.audio_files[0]) || null;
  if (!file?.url) return null;
  // QF returns relative URLs; prefix the CDN if needed.
  const url = file.url.startsWith('http')
    ? file.url
    : `https://verses.quran.foundation/${file.url}`;
  return { url, reciterId, raw: file };
}
