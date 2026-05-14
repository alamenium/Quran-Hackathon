// Recitation classes — themed bundles of verses the user practices reciting,
// one verse at a time, with the faster-whisper sidecar scoring each attempt.
//
// Every `verses` entry must reference a verse_key that exists in
// quranContent.js (the routes file enforces this with getVerse()).
//
// Levels:  beginner | intermediate | advanced
// Difficulty is informational — it controls UI badge colour only.

export const CLASSES = [
  {
    id: 'al-fatiha',
    title: 'Surah Al-Fatiha',
    subtitle: 'The Opening · 7 ayat',
    description:
      'The seven ayat of Al-Fatiha — the surah every Muslim recites in every prayer. Learn it ayah by ayah.',
    level: 'beginner',
    emoji: '📖',
    color: 'gold',
    xp: 50,
    verses: ['1:1', '1:2', '1:3', '1:4', '1:5', '1:6', '1:7'],
  },
  {
    id: 'al-kawthar',
    title: 'Surah Al-Kawthar',
    subtitle: 'The Abundance · 3 ayat',
    description:
      'The shortest surah in the Quran. Three short ayat — perfect for your very first recitation class.',
    level: 'beginner',
    emoji: '🌊',
    color: 'blue',
    xp: 30,
    verses: ['108:1', '108:2', '108:3'],
  },
  {
    id: 'al-asr',
    title: 'Surah Al-Asr',
    subtitle: 'Time · 3 ayat',
    description:
      'A short surah with a powerful message about time, faith, and patience. Three ayat to recite.',
    level: 'beginner',
    emoji: '⏳',
    color: 'purple',
    xp: 30,
    verses: ['103:1', '103:2', '103:3'],
  },
  {
    id: 'al-ikhlas',
    title: 'Surah Al-Ikhlas',
    subtitle: 'Sincerity · 4 ayat',
    description:
      'The four ayat of Al-Ikhlas — the surah that the Prophet ﷺ said equals one third of the Quran.',
    level: 'beginner',
    emoji: '✨',
    color: 'pink',
    xp: 40,
    verses: ['112:1', '112:2', '112:3', '112:4'],
  },
  {
    id: 'al-muawwidhatayn',
    title: 'Al-Muʻawwidhatayn',
    subtitle: 'Al-Falaq + An-Nas · 11 ayat',
    description:
      'The two "surahs of refuge" — recited together morning and evening for protection. Eleven ayat in all.',
    level: 'intermediate',
    emoji: '🛡️',
    color: 'green',
    xp: 80,
    verses: [
      '113:1', '113:2', '113:3', '113:4', '113:5',
      '114:1', '114:2', '114:3', '114:4', '114:5', '114:6',
    ],
  },
  {
    id: 'three-quls',
    title: 'The Three Quls',
    subtitle: 'Al-Ikhlas + Al-Falaq + An-Nas · 15 ayat',
    description:
      'Three short surahs the Prophet ﷺ would recite together for protection. A great memorisation milestone.',
    level: 'advanced',
    emoji: '🌙',
    color: 'gold',
    xp: 120,
    verses: [
      '112:1', '112:2', '112:3', '112:4',
      '113:1', '113:2', '113:3', '113:4', '113:5',
      '114:1', '114:2', '114:3', '114:4', '114:5', '114:6',
    ],
  },
];

// Lookup helpers used by the route layer.
export function listClasses() {
  return CLASSES.map((c) => ({
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    description: c.description,
    level: c.level,
    emoji: c.emoji,
    color: c.color,
    xp: c.xp,
    verseCount: c.verses.length,
  }));
}

export function findClass(id) {
  return CLASSES.find((c) => c.id === id) || null;
}
