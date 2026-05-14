// Recitation verification.
//
// Two-mode operation — the *scoring* logic is identical, only the
// transcription source differs:
//
//   AI mode  (preferred): browser → POST /api/recitation/verify-audio with
//            raw audio bytes. The Node server forwards the audio to the
//            faster-whisper Python sidecar in asr_service/, gets an Arabic
//            transcript back, and scores it.
//
//   Fallback: browser uses the Web Speech API locally, then POSTs the
//            transcript to /api/recitation/verify. The server scores it.
//            This path runs automatically when the ASR sidecar is down or
//            still loading the model.
//
// Scoring: normalize Arabic (strip diacritics, unify alif/yaa/taa marbuta,
// collapse whitespace), then Levenshtein-similarity against the canonical
// Uthmani text.

import { getVerse } from '../data/quranContent.js';

const ASR_URL = process.env.ASR_URL || 'http://localhost:5005';

// --- Arabic normalization & scoring ----------------------------------------

function normalizeArabic(s) {
  if (!s) return '';
  return (
    s
      // remove diacritics (fatha, kasra, damma, sukun, shadda, tanween, etc.)
      .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
      // unify alif forms
      .replace(/[\u0622\u0623\u0625]/g, 'ا')
      // unify yaa
      .replace(/[\u0649]/g, 'ي')
      // taa marbuta -> haa
      .replace(/[\u0629]/g, 'ه')
      // collapse whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}

function score(expected, got) {
  const e = normalizeArabic(expected);
  const g = normalizeArabic(got);
  if (!g) return { score: 0, e, g };
  const dist = levenshtein(e, g);
  const len = Math.max(e.length, g.length);
  return { score: Math.round((1 - dist / len) * 100), e, g };
}

function statusFromScore(s) {
  if (s >= 85) return ['excellent', 'MashaAllah! Beautiful recitation.'];
  if (s >= 65) return ['good', "Good effort! A little more practice and you'll have it perfectly."];
  if (s >= 40) return ['partial', "You've got some of it. Listen to the audio one more time, then try again."];
  return ['try_again', "Let's try once more. Tap the audio button to hear it, then repeat slowly."];
}

// --- Public API ------------------------------------------------------------

export function compareRecitation({ verseKey, transcript }) {
  const verse = getVerse(verseKey);
  if (!verse) return { ok: false, error: 'Unknown verse' };

  if (!transcript || !transcript.trim()) {
    return {
      ok: false,
      score: 0,
      message:
        "We didn't hear your recitation. Tap the mic and try again in a quiet spot.",
    };
  }

  const { score: s, e, g } = score(verse.text_uthmani, transcript);
  const [status, message] = statusFromScore(s);

  return {
    ok: true,
    verse_key: verseKey,
    score: s,
    status,
    message,
    transcript,
    expected_text: verse.text_uthmani,
    expected_normalized: e,
    got_normalized: g,
  };
}

// --- ASR service integration -----------------------------------------------

export async function asrHealth() {
  try {
    const res = await fetch(`${ASR_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return { available: false };
    const data = await res.json();
    return { available: true, ...data };
  } catch {
    return { available: false };
  }
}

export async function transcribeAudio(audioBuffer, filename = 'recording.webm') {
  // Build multipart body manually so we don't pull in another dependency.
  const boundary = '----ayahquest' + Math.random().toString(16).slice(2);
  const enc = new TextEncoder();
  const head = enc.encode(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="audio"; filename="${filename}"\r\n` +
      `Content-Type: application/octet-stream\r\n\r\n`
  );
  const tail = enc.encode(`\r\n--${boundary}--\r\n`);

  const body = new Uint8Array(head.length + audioBuffer.length + tail.length);
  body.set(head, 0);
  body.set(audioBuffer, head.length);
  body.set(tail, head.length + audioBuffer.length);

  const res = await fetch(`${ASR_URL}/transcribe`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ASR service ${res.status}: ${text}`);
  }
  return res.json(); // { transcript, sample_rate, duration_sec }
}
