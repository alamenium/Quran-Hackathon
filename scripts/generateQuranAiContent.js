#!/usr/bin/env node
// ---------------------------------------------------------------------------
// scripts/generateQuranAiContent.js
//
// Documentation / smoke-test runner for the quran.ai content pipeline.
//
// This script does NOT make live HTTP calls to quran.ai. The quran.ai
// connector is an MCP server intended to be used through an MCP-aware
// host (e.g. Claude). Live runtime calls would require an MCP client.
//
// This runner exists to:
//   1. Document the exact tool sequence the human + Claude session used.
//   2. Validate that the cached content pack and source manifest are
//      consistent with each other (every manifest ayah is present in the
//      content pack, every content-pack source field references the
//      correct editions, etc.).
//
// Usage:
//   node scripts/generateQuranAiContent.js
//
// To regenerate content, follow the procedure in
// docs/quran-ai-content-pipeline.md from an MCP-aware Claude session.
// ---------------------------------------------------------------------------

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  QURAN_AI_VERSES,
  QURAN_AI_WORDS,
  QURAN_AI_SECTIONS,
  QURAN_AI_GRATITUDE_QUEST_14_34,
} from '../server/src/data/quranAiContentPack.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manifestPath = path.resolve(
  __dirname,
  '../server/src/data/quranAiSourceManifest.json'
);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const PIPELINE_STEPS = [
  '1.  fetch_grounding_rules                    [required first call]',
  '2.  list_editions(["tafsir","translation"])  [confirm editions exist]',
  '3.  search_quran / search_translation        [theme discovery]',
  '4.  fetch_quran(ayahs=[...], ar-simple-clean) [canonical Arabic]',
  '5.  fetch_translation(ayahs=[...], en-abdel-haleem) [verified English]',
  '6.  fetch_tafsir(ayahs=[...], [ar-muyassar, ar-saadi]) [scholarly basis]',
  '7.  fetch_word_morphology(ayah_key, word)    [roots / lemmas / forms]',
];

console.log('\n=== AyahQuest · quran.ai content generation pipeline ===\n');
PIPELINE_STEPS.forEach((s) => console.log('  ' + s));

console.log('\n=== Editions used ===');
console.log('  Quran:       ' + manifest.editions.quranText.id);
console.log('  Translation: ' + manifest.editions.translation.id);
manifest.editions.tafsir.forEach((t) => {
  console.log('  Tafsir:      ' + t.id + ' (' + t.author + ')');
});

console.log('\n=== Themes and ayahs in the content pack ===');
manifest.themes.forEach((theme) => {
  console.log(`\n  · ${theme.theme}  (${theme.section})`);
  console.log(`      ayahs: ${(theme.newAyahs || []).join(', ') || '(none new)'}`);
});

// --- Consistency checks ---
const errors = [];
const warnings = [];

// Every ayah in the manifest must exist in the content pack VERSES (or
// be a pre-existing ayah we did not re-add).
const preExisting = new Set();
manifest.themes.forEach((t) =>
  (t.preExistingAyahsUsed || []).forEach((a) => preExisting.add(a))
);
manifest.ayahManifest.forEach((entry) => {
  if (preExisting.has(entry.ayah)) return;
  if (!QURAN_AI_VERSES[entry.ayah]) {
    errors.push(
      `Manifest claims ayah ${entry.ayah} is in the content pack, but it is not.`
    );
  } else {
    const src = QURAN_AI_VERSES[entry.ayah].source;
    if (!src || src.generatedWith !== 'quran.ai') {
      errors.push(`Ayah ${entry.ayah} is missing source.generatedWith = "quran.ai".`);
    }
    if (src && src.translationEdition !== entry.translationEdition) {
      warnings.push(
        `Ayah ${entry.ayah}: source has translationEdition=${src.translationEdition}, manifest expects ${entry.translationEdition}.`
      );
    }
  }
});

// Every word in QURAN_AI_WORDS must have a quran.ai source.
QURAN_AI_WORDS.forEach((w) => {
  if (!w.source || w.source.generatedWith !== 'quran.ai') {
    errors.push(`Word ${w.id} is missing source.generatedWith = "quran.ai".`);
  }
});

// Every quest in QURAN_AI_SECTIONS must have a source.
QURAN_AI_SECTIONS.forEach((sec) =>
  sec.units.forEach((u) =>
    u.quests.forEach((q) => {
      if (!q.source || q.source.generatedWith !== 'quran.ai') {
        errors.push(`Quest ${q.id} is missing source.generatedWith = "quran.ai".`);
      }
    })
  )
);
if (
  !QURAN_AI_GRATITUDE_QUEST_14_34.source ||
  QURAN_AI_GRATITUDE_QUEST_14_34.source.generatedWith !== 'quran.ai'
) {
  errors.push(
    `Quest ${QURAN_AI_GRATITUDE_QUEST_14_34.id} is missing source.generatedWith = "quran.ai".`
  );
}

console.log('\n=== Content pack ↔ manifest consistency check ===');
console.log(`  Ayahs in pack:        ${Object.keys(QURAN_AI_VERSES).length}`);
console.log(`  Words in pack:        ${QURAN_AI_WORDS.length}`);
console.log(`  New sections in pack: ${QURAN_AI_SECTIONS.length}`);
console.log(`  Manifest ayah entries: ${manifest.ayahManifest.length}`);

if (warnings.length) {
  console.log('\n  warnings:');
  warnings.forEach((w) => console.log('    - ' + w));
}
if (errors.length) {
  console.log('\n  ERRORS:');
  errors.forEach((e) => console.log('    ✗ ' + e));
  process.exitCode = 1;
} else {
  console.log('\n  ✓ pack & manifest are consistent. No errors.');
}

console.log(
  '\n  Runtime behaviour: the app does NOT call quran.ai at runtime.'
);
console.log(
  '  See docs/quran-ai-content-pipeline.md for regeneration steps.\n'
);
