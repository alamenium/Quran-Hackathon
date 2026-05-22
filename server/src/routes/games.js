// server/src/routes/games.js
//
// /api/games/* — educational mini-games.
//
// Currently hosts the "Guess the Prophet" game. The Quran ayah text and
// translations come from the Quran Foundation Content API (with graceful
// local fallback via server/src/data/quranContent.js). The frontend never
// hard-codes Quran text or translations.
//
// GET /api/games/guess-prophet
//   → returns 6 game cards, each with fetchedAyahs + fetchedTranslations
//     drawn from QF Content API (best-effort), plus a 1-sentence
//     child-friendly clue derived from safe symbolic hints. The game
//     itself is fully playable without ayah text — the ayahs are an
//     enrichment, not a hard requirement.

import { Router } from 'express';
import {
  isConfigured as qfConfigured,
  getVerseByKey,
  QF_DEFAULTS,
} from '../services/quranFoundationContentApi.js';
import { getVerse } from '../data/quranContent.js';

const router = Router();

// ── Static config — IDs, names, references, safe object hints ──────────────
// Per the brief, ONLY these structural fields are local. All Quran text and
// translations are fetched from the Content API at request time.
const PROPHETS = [
  {
    id: 'nuh',
    answer: 'Nuh',
    arabicAnswer: 'نوح',
    quranRefs: ['23:27', '11:40', '11:41', '11:42', '29:15'],
    objectHints: ['ark', 'rain', 'animals_pair'],
    imageType: 'ark_scene',
    alt: 'A wooden ark floating on water with rain clouds above and pairs of animals',
  },
  {
    id: 'musa',
    answer: 'Musa',
    arabicAnswer: 'موسى',
    quranRefs: ['26:63', '20:77', '7:117'],
    objectHints: ['staff', 'split_sea', 'dry_path'],
    imageType: 'split_sea_scene',
    alt: 'A sea split into two walls of water with a dry path between them and a staff in the foreground',
  },
  {
    id: 'yunus',
    answer: 'Yunus',
    arabicAnswer: 'يونس',
    quranRefs: ['21:87', '37:139', '37:140', '37:142', '68:48'],
    objectHints: ['large_fish', 'dark_sea', 'small_boat'],
    imageType: 'fish_scene',
    alt: 'A large fish in a dark sea with a small boat in the distance',
  },
  {
    id: 'yusuf',
    answer: 'Yusuf',
    arabicAnswer: 'يوسف',
    quranRefs: ['12:4', '12:19', '12:18', '12:96'],
    objectHints: ['stars', 'well_bucket', 'shirt'],
    imageType: 'stars_well_scene',
    alt: 'A starry night sky beside a stone well with a bucket and a folded shirt',
  },
  {
    id: 'sulayman',
    answer: 'Sulayman',
    arabicAnswer: 'سليمان',
    quranRefs: ['27:16', '27:18', '27:20', '27:22'],
    objectHints: ['ants', 'hoopoe', 'valley'],
    imageType: 'valley_scene',
    alt: 'A valley with a line of ants and a hoopoe bird perched on a branch',
  },
  {
    id: 'ibrahim',
    answer: 'Ibrahim',
    arabicAnswer: 'إبراهيم',
    quranRefs: ['21:69', '29:24', '19:41'],
    objectHints: ['gentle_flame', 'cool_glow', 'green_leaves'],
    imageType: 'cool_flame_scene',
    alt: 'A gentle flame surrounded by a cool blue glow and green leaves',
  },
];

// ── Object hint → child-friendly word ──────────────────────────────────────
// Used to compose the 1-sentence clue. The clue mentions the safe symbolic
// objects from the brief — it does NOT mention the prophet's name.
const HINT_LABELS = {
  ark: 'a great ark',
  rain: 'heavy rain',
  animals_pair: 'pairs of animals',
  staff: 'a strong staff',
  split_sea: 'a sea split in two',
  dry_path: 'a dry path through water',
  large_fish: 'a very large fish',
  dark_sea: 'the dark sea',
  small_boat: 'a small boat',
  stars: 'eleven bright stars',
  well_bucket: 'a deep well and bucket',
  shirt: 'a special shirt',
  ants: 'a long line of ants',
  hoopoe: 'a hoopoe bird with a message',
  valley: 'a quiet valley',
  gentle_flame: 'a fire that turned gentle',
  cool_glow: 'a cool blue glow',
  green_leaves: 'fresh green leaves',
};

function composeClue(prophet) {
  // 1 simple sentence built from the safe symbolic hints.
  // Per the brief: short, child-friendly, no long tafsir, no quotation,
  // doesn't reveal the prophet's name.
  const phrases = prophet.objectHints.map((h) => HINT_LABELS[h]).filter(Boolean);
  if (phrases.length === 0) return 'Symbols and clues from this Prophet\'s story.';
  if (phrases.length === 1) return `${capitalize(phrases[0])} is a clue from this Prophet's story.`;
  if (phrases.length === 2) return `${capitalize(phrases[0])} and ${phrases[1]} are clues from this Prophet's story.`;
  // 3+: list with commas
  const head = phrases.slice(0, -1).join(', ');
  const tail = phrases[phrases.length - 1];
  return `${capitalize(head)}, and ${tail} are clues from this Prophet's story.`;
}
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Strip footnote markers / HTML from QF translation text.
function stripHtml(s) {
  if (!s) return '';
  return String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

// ── Fetch all verses for one prophet, with fallback ────────────────────────
// Returns best-effort ayah enrichment. Never throws — failures are absorbed
// so the game card is always built and the round is always playable.
async function fetchProphetVerses(prophet) {
  const fetchedAyahs = [];
  const fetchedTranslations = [];
  let liveCount = 0;
  let localCount = 0;

  for (const ref of prophet.quranRefs) {
    let arabic = null;
    let translation = null;
    let source = null;

    // 1. Try live QF Content API
    if (qfConfigured()) {
      try {
        const v = await getVerseByKey(ref);
        if (v) {
          arabic = v.text_uthmani || v.text_imlaei;
          translation = stripHtml(v.translations?.[0]?.text);
          source = 'quran-foundation-v4';
          liveCount++;
        }
      } catch (err) {
        // Swallow — fall through to local fallback. The round still plays.
        console.warn(`[games/guess-prophet] live fetch failed for ${ref}: ${err.message}`);
      }
    }

    // 2. Local fallback (still a backend source, not the frontend)
    if (!arabic) {
      const local = getVerse(ref);
      if (local) {
        arabic = local.text_uthmani;
        translation = local.translation;
        source = 'local-cache';
        localCount++;
      }
    }

    if (arabic) {
      fetchedAyahs.push({ verseKey: ref, arabic, source });
      fetchedTranslations.push({ verseKey: ref, translation: translation || '', source });
    }
  }

  return {
    fetchedAyahs,
    fetchedTranslations,
    sourceSummary: {
      live: liveCount,
      local: localCount,
      total: prophet.quranRefs.length,
    },
  };
}

// ── GET /api/games/guess-prophet ───────────────────────────────────────────
router.get('/guess-prophet', async (_req, res, next) => {
  try {
    const names = PROPHETS.map((p) => p.answer);

    // Fetch all prophets in parallel
    const cards = await Promise.all(
      PROPHETS.map(async (p) => {
        const { fetchedAyahs, fetchedTranslations, sourceSummary } =
          await fetchProphetVerses(p);

        // Generate 3 dynamic answer choices: correct + 2 random others
        const otherNames = names.filter((n) => n !== p.answer);
        const distractors = shuffle(otherNames).slice(0, 2);
        const answerChoices = shuffle([p.answer, ...distractors]);

        return {
          id: p.id,
          answer: p.answer,
          arabicAnswer: p.arabicAnswer,
          quranRefs: p.quranRefs,
          fetchedAyahs,
          fetchedTranslations,
          childFriendlyClue: composeClue(p),
          objectHints: p.objectHints,
          imageType: p.imageType,
          alt: p.alt,
          answerChoices,
          source: {
            provider: sourceSummary.live > 0
              ? 'Quran Foundation Content API v4'
              : (sourceSummary.local > 0 ? 'local-cache' : 'none'),
            translationResource: QF_DEFAULTS.translationId,
            fallbackUsed: sourceSummary.live === 0,
            liveAyahs: sourceSummary.live,
            localAyahs: sourceSummary.local,
            totalAyahs: sourceSummary.total,
          },
        };
      })
    );

    // The game is playable without ayah text — image, clue and answer
    // choices are sufficient. Ayahs are an enrichment. We therefore always
    // return 200 with the full set of cards rather than 503'ing the whole
    // round just because the Quran Foundation API or the local cache had
    // no entry for these specific references.
    res.json({ cards, generatedAt: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default router;
