# quran.ai content pipeline (AyahQuest)

## What this is

AyahQuest uses the **quran.ai** Model Context Protocol (MCP) server as a
**development-time** Quran content engine. The connector is used during
content authoring to fetch verified Arabic text, English translations,
tafsir, and word morphology. The results are cached locally in
`server/src/data/quranAiContentPack.js` and audited in
`server/src/data/quranAiSourceManifest.json` so the running demo never
needs live access to quran.ai.

```
quran.ai connector  (dev time)
   → search/fetch verified Quran content
   → fetch translation, tafsir, morphology, related ayahs
   → create local source-grounded content pack
   → integrate into the app's existing routes
   → app runs reliably without quran.ai runtime access
```

## Why cache locally

The hackathon demo must be reliable: no live API key bookkeeping at
demo time, no rate limit risk, no network dependency for content the
app already used during authoring. quran.ai is the *trusted authoring
backend*; the app is its trusted *delivery* surface.

## Tools used

Every Quran-related piece of content added through this pipeline was
produced using these quran.ai tools, in this order:

1. **`fetch_grounding_rules`** — required first call. Returns the
   grounding contract every other tool depends on. Returns a
   `grounding_nonce` we pass to subsequent calls.
2. **`list_editions(edition_type=["tafsir","translation"], lang="en")`** —
   confirms `en-abdel-haleem`, `ar-muyassar`, and `ar-saadi` are available
   before we depend on them.
3. **`search_quran`** / **`search_translation`** — used for theme
   discovery (e.g. confirming child-appropriate "Allah loves ___" verses).
4. **`fetch_quran`** with `editions=ar-simple-clean` — exact Arabic text.
   Cached into `QURAN_AI_VERSES[verseKey].text_uthmani`.
5. **`fetch_translation`** with `editions=en-abdel-haleem` — verified
   English translation. Cached into `.translation`.
6. **`fetch_tafsir`** with `editions=["ar-muyassar","ar-saadi"]` — used
   to produce the child-friendly `.tafsir_simple` paraphrase. The
   paraphrase is **derived from** the fetched tafsir; it is not a
   verbatim quote of either source.
7. **`fetch_word_morphology`** — for every word card in
   `QURAN_AI_WORDS`. Captures root, lemma, verb form, and frequency.

## Editions chosen

| Use            | Edition           | Source                         |
|----------------|-------------------|--------------------------------|
| Arabic text    | `ar-simple-clean` | quran.com canonical            |
| Translation    | `en-abdel-haleem` | Muhammad A. S. Abdel Haleem    |
| Tafsir A       | `ar-muyassar`     | King Fahd Qur'an Printing Complex |
| Tafsir B       | `ar-saadi`        | Abd al-Rahman al-Saʿdi        |

Pre-existing verses in `quranContent.js` keep their original
Saheeh-International translations (mixed state is recorded in the
manifest's `editions.translation.note`).

## How to regenerate the local pack

The runtime app does NOT call quran.ai. Regeneration is a deliberate,
development-time action.

1. Open a Claude session that has the quran.ai MCP connector enabled.
2. Call `fetch_grounding_rules` first.
3. For every new ayah:
   - Decide the theme and shortlist candidate ayahs (use
     `search_quran(query=..., translations='en-abdel-haleem')`).
   - Verify each ayah is child-appropriate for ages 7+. Exclude any
     ayah whose translation contains adult, legal, or otherwise
     unsuitable context.
   - Call `fetch_quran(ayahs=[...], editions='ar-simple-clean')`.
   - Call `fetch_translation(ayahs=[...], editions='en-abdel-haleem')`.
   - Call `fetch_tafsir(ayahs=[...], editions=['ar-muyassar','ar-saadi'])`.
   - Write a child-friendly `tafsir_simple` paraphrase based on what
     you fetched. Do not write from memory.
4. For every new word card:
   - Call `fetch_word_morphology(ayah_key, word_text)` and copy the
     `root`, `lemma`, `verbForm`, and frequency into the word object.
5. Append entries to `quranAiContentPack.js` (`QURAN_AI_VERSES`,
   `QURAN_AI_WORDS`, plus any new quests/sections).
6. Append entries to `quranAiSourceManifest.json`:
   - Under `ayahManifest`: a record per ayah with the tools used.
   - Under `morphologyManifest`: one record per word card.
7. Every quran.ai-powered entity should carry a `source` field:
   ```js
   source: {
     generatedWith: 'quran.ai',
     quranEdition: 'ar-simple-clean',
     translationEdition: 'en-abdel-haleem',
     tafsirSources: ['ar-muyassar', 'ar-saadi'],
     toolsUsed: ['search_quran','fetch_quran','fetch_translation',
                 'fetch_tafsir','fetch_word_morphology'],
   }
   ```

## How content flows into the app

- `quranContent.js` merges `QURAN_AI_VERSES` into the `VERSES` map and
  `QURAN_AI_SURAHS` into `SURAHS`. Pre-existing entries always win on
  key conflict, so we never overwrite verified content already in
  the project.
- `curriculum.js` imports the new gratitude quest
  (`QURAN_AI_GRATITUDE_QUEST_14_34`) into the existing gratitude unit,
  and pushes `QURAN_AI_SECTIONS` (Who Allah Loves, Quran Wonders) into
  the `SECTIONS` array.
- The existing `/api/quests/*` and `/api/quran/*` routes pick up the
  new content with no API changes.
- `/api/quests/source-manifest` is a new read-only endpoint that
  exposes the manifest for judges or a "source proof" UI.

## How the UI surfaces the source

- `QuestPage` renders a small `SourceBadge` and a `SourceCard` at the
  end of any quest whose `quest.source.generatedWith === 'quran.ai'`.
- `QuestPage` shows a final "Explore More" step listing the quest's
  `related_ayahs`, hydrated server-side.
- The Word Explorer (Toolkit "Words" tab) automatically picks up the
  new morphology-backed word cards through the existing
  `/api/quran/words` endpoint.
- `TutorPage` forwards the active quest's `source` and `tafsir_simple`
  as `lessonContext` to `/api/ai/tutor`. The Gemini tutor recognizes
  the quran.ai grounding and answers using only the lesson sources.

## Hard rules to preserve

- The runtime app must never depend on live quran.ai access.
- No tafsir is ever quoted verbatim; the `tafsir_simple` field is
  always a child-friendly paraphrase derived from the fetched tafsir.
- No ayah reference, translation, or root is ever filled in from
  model memory — every value is captured from a quran.ai tool call.
- The fatwa refusal behavior in `tutorAnswer` is preserved.
- All Storybook, recitation, Gemini-summary, ElevenLabs, Firebase,
  XP/streak/badge, and roadmap features remain untouched.
