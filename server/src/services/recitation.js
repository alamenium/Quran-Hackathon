// Recitation verification.
//
// Two-mode operation — the *comparison* logic is identical, only the
// transcription source differs:
//
//   AI mode  (preferred): browser → POST /api/recitation/verify-audio with
//            raw audio bytes. The Node server forwards the audio to the
//            faster-whisper Python sidecar in asr_service/, gets an Arabic
//            transcript back, and compares it.
//
//   Fallback: browser uses the Web Speech API locally, then POSTs the
//            transcript to /api/recitation/verify. The server compares it.
//
// Comparison model (no numerical score — see compareWords below):
//   - Split canonical and user transcripts into words.
//   - Align them sequentially, tolerating small skips so a missed word
//     doesn't cascade into every following word being marked wrong.
//   - For each canonical word, classify the user's attempt as:
//       'match'              — letters match (and any user-supplied diacritics
//                              also match the canonical).
//       'wrong-diacritics'   — letters match but a diacritic the user spoke
//                              disagrees with the canonical. RED in the UI.
//       'wrong-letters'      — letters differ (different word). RED.
//       'missing'            — user didn't say this word at all. Grey.
//   - The user "passes" the verse iff there are no 'wrong-letters' and
//     no 'wrong-diacritics' words. Missing words don't fail the verse.
//
// We render the canonical Arabic with full Quranic diacritization in the
// client, colouring each word per its status, so the user always sees the
// correct spelling (including dagger alif ـٰ and alef wasla ٱ) even when
// their own transcript was unvocalised.

import { getVerse } from '../data/quranContent.js';

const ASR_URL = process.env.ASR_URL || 'http://localhost:5005';

// ---------------------------------------------------------------------------
// Arabic normalisation — diacritics and letter equivalences.
//
// We treat several letter forms as the *same* sound when comparing letters,
// even though the Quran writes them differently:
//
//   ا   U+0627  alef                             — base form
//   أ   U+0623  alef + hamza above               → ا
//   إ   U+0625  alef + hamza below               → ا
//   آ   U+0622  alef + madda                     → ا
//   ٱ   U+0671  alef wasla (Quranic prosthetic) → ا
//   ـٰ  U+0670  superscript / "dagger" alef     → ا  (dropped + treated as ا
//                                                    when it occurs above a letter)
//
//   ي   U+064A  yeh                              — base form
//   ى   U+0649  alef maksura                    → ي
//   ئ   U+0626  yeh with hamza                  → ي
//   ؤ   U+0624  waw with hamza                  → و
//   ة   U+0629  taa marbuta                     → ه
//   ك   U+0643  kaf                              — base form
//   ک   U+06A9  Persian keheh                   → ك
//
// Diacritic block (purely cosmetic — no phonetic content):
//   U+064B..U+0652  harakat + sukun + shadda + tanween
//   U+0653..U+065F  extended Quranic marks (madda/hamza marks above & below)
//   U+0640          tatweel (visual elongation only)
//
// IMPORTANT: U+0670 (dagger / superscript alef) is NOT a diacritic — it
// stands in for a full alef letter. The Quran uses it because the consonantal
// rasm of these words doesn't include an explicit ا, but the sound is alef.
// We keep U+0670 in the input and convert it to 'ا' below so that
// أَعْطَيْنَـٰكَ ≡ أعطيناك at the letter level.
// ---------------------------------------------------------------------------

const DIACRITIC_RE = /[ً-ْٓ-ٟـ]/g;

// Letter equivalence table: source code-point → canonical form for comparison.
const LETTER_EQUIV = {
  'آ': 'ا', // alef + madda           → ا
  'أ': 'ا', // alef + hamza above    → ا
  'إ': 'ا', // alef + hamza below    → ا
  'ٱ': 'ا', // alef wasla            → ا
  'ٰ': 'ا', // U+0670 dagger alef    → ا   ← key fix: it's a letter, not a mark
  'ى': 'ي', // alef maksura          → ي
  'ئ': 'ي', // yeh + hamza           → ي
  'ؤ': 'و', // waw + hamza           → و
  'ة': 'ه', // taa marbuta           → ه
  'ک': 'ك', // Persian keheh         → ك
  'ی': 'ي', // Persian yeh           → ي
};

// Strip everything BUT the base letters: drop diacritics, then unify letter
// forms, then collapse whitespace.
export function normalizeLetters(s) {
  if (!s) return '';
  let out = s.replace(DIACRITIC_RE, '');
  out = out.replace(/./gu, (ch) => LETTER_EQUIV[ch] || ch);
  return out.replace(/\s+/g, ' ').trim();
}

// Extract just the diacritic marks from a word, in order. Used to compare
// the user's vocalisation against the canonical.
export function extractDiacritics(word) {
  if (!word) return '';
  const marks = word.match(DIACRITIC_RE);
  return marks ? marks.join('') : '';
}

// Backward-compatible name used by older callers (and the `_normalized`
// fields kept in the response below for debugging).
export function normalizeArabic(s) {
  return normalizeLetters(s);
}

// ---------------------------------------------------------------------------
// Word-level alignment + classification.
// ---------------------------------------------------------------------------

const PUNCT_RE = /[\.,;:?!،؛؟۔‏‎"'`]/g;

function splitWords(s) {
  if (!s) return [];
  return s
    .replace(PUNCT_RE, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function classifyWord(canonicalWord, userWord) {
  const canonLetters = normalizeLetters(canonicalWord);
  const userLetters = normalizeLetters(userWord);

  if (canonLetters !== userLetters) return 'wrong-letters';

  // Letters match. Did the user offer any diacritics? If not, that's fine
  // (Web Speech almost always returns unvocalised text). If they did, they
  // must agree with the canonical.
  const userMarks = extractDiacritics(userWord);
  if (!userMarks) return 'match';

  const canonMarks = extractDiacritics(canonicalWord);
  return userMarks === canonMarks ? 'match' : 'wrong-diacritics';
}

// Sequential word alignment with a small lookahead. Tolerates the user
// inserting an extra word, skipping a word, or saying a word slightly
// differently — so a single hiccup doesn't cascade.
//
// Returns an array of { word: <canonical-with-diacritics>, status }.
export function compareWords(canonical, user) {
  const C = splitWords(canonical);
  const U = splitWords(user);
  const out = [];
  let ui = 0;
  const LOOKAHEAD = 2;

  for (let ci = 0; ci < C.length; ci++) {
    const canonWord = C[ci];

    if (ui >= U.length) {
      out.push({ word: canonWord, status: 'missing' });
      continue;
    }

    const direct = classifyWord(canonWord, U[ui]);
    if (direct === 'match' || direct === 'wrong-diacritics') {
      out.push({ word: canonWord, status: direct });
      ui++;
      continue;
    }

    // Try lookahead: maybe the user inserted an extra word.
    let matched = false;
    for (let skip = 1; skip <= LOOKAHEAD && ui + skip < U.length; skip++) {
      const trial = classifyWord(canonWord, U[ui + skip]);
      if (trial === 'match' || trial === 'wrong-diacritics') {
        out.push({ word: canonWord, status: trial });
        ui = ui + skip + 1;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Try lookahead in C: maybe the user skipped a canonical word.
    let canonSkip = false;
    for (let skip = 1; skip <= LOOKAHEAD && ci + skip < C.length; skip++) {
      const trial = classifyWord(C[ci + skip], U[ui]);
      if (trial === 'match' || trial === 'wrong-diacritics') {
        // Mark intervening canonical words as missing, then re-align.
        for (let k = 0; k < skip; k++) {
          out.push({ word: C[ci + k], status: 'missing' });
        }
        out.push({ word: C[ci + skip], status: trial });
        ci += skip;
        ui++;
        canonSkip = true;
        break;
      }
    }
    if (canonSkip) continue;

    // No alignment found in window — user said a different word here.
    out.push({ word: canonWord, status: 'wrong-letters' });
    ui++;
  }

  return out;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function compareRecitation({ verseKey, transcript }) {
  const verse = getVerse(verseKey);
  if (!verse) return { ok: false, error: 'Unknown verse' };

  if (!transcript || !transcript.trim()) {
    return {
      ok: false,
      message:
        "We didn't hear your recitation. Tap the mic and try again in a quiet spot.",
      words: splitWords(verse.text_uthmani).map((w) => ({
        word: w,
        status: 'missing',
      })),
      passed: false,
      transcript: '',
      expected_text: verse.text_uthmani,
    };
  }

  const words = compareWords(verse.text_uthmani, transcript);
  const wrong = words.filter(
    (w) => w.status === 'wrong-letters' || w.status === 'wrong-diacritics'
  ).length;
  const matched = words.filter((w) => w.status === 'match').length;
  const passed = wrong === 0 && matched > 0;

  let message;
  if (passed && matched === words.length) {
    message = 'MashaAllah! Beautiful recitation.';
  } else if (passed) {
    message = "Good — every word you said was right. Try saying the missing words next time.";
  } else if (wrong === 1) {
    message = 'Almost there — one word looks off. Try the red word again.';
  } else {
    message = "Let's try once more. Listen to the audio above and repeat slowly.";
  }

  return {
    ok: true,
    verse_key: verseKey,
    transcript,
    expected_text: verse.text_uthmani,
    words,
    passed,
    message,
    summary: {
      total: words.length,
      matched,
      wrong,
      missing: words.length - matched - wrong,
    },
  };
}

// ---------------------------------------------------------------------------
// ASR service integration
// ---------------------------------------------------------------------------

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
