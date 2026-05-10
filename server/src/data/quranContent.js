// Offline Quran content used as a fallback when Quran Foundation API
// credentials are not configured, and as a curated set of "quest" verses
// regardless of the data source.
//
// Arabic text (Uthmani script) and English translation (Saheeh International)
// match the content distributed by the Quran Foundation Content APIs, so
// switching to live API mode produces the same words for the same verses.
//
// Tafsir summaries are short, child-friendly paraphrases (not direct quotes
// from copyrighted tafsir works), written for ages 8–14 in plain English.

export const SURAHS = {
  1: {
    id: 1,
    name_arabic: 'الفاتحة',
    name_simple: 'Al-Fatihah',
    name_english: 'The Opener',
    revelation_place: 'makkah',
    verses_count: 7,
    bismillah_pre: false,
  },
  103: {
    id: 103,
    name_arabic: 'العصر',
    name_simple: 'Al-Asr',
    name_english: 'The Declining Day',
    revelation_place: 'makkah',
    verses_count: 3,
    bismillah_pre: true,
  },
  108: {
    id: 108,
    name_arabic: 'الكوثر',
    name_simple: 'Al-Kawthar',
    name_english: 'Abundance',
    revelation_place: 'makkah',
    verses_count: 3,
    bismillah_pre: true,
  },
  112: {
    id: 112,
    name_arabic: 'الإخلاص',
    name_simple: 'Al-Ikhlas',
    name_english: 'Sincerity',
    revelation_place: 'makkah',
    verses_count: 4,
    bismillah_pre: true,
  },
  113: {
    id: 113,
    name_arabic: 'الفلق',
    name_simple: 'Al-Falaq',
    name_english: 'The Daybreak',
    revelation_place: 'makkah',
    verses_count: 5,
    bismillah_pre: true,
  },
  114: {
    id: 114,
    name_arabic: 'الناس',
    name_simple: 'An-Nas',
    name_english: 'Mankind',
    revelation_place: 'makkah',
    verses_count: 6,
    bismillah_pre: true,
  },
};

// Verses are keyed by "surah:ayah". Audio uses the EveryAyah CDN which mirrors
// the same recitation files available through the Quran Foundation Audio API
// (Mishary Rashid Alafasy, reciter id 7 in QF). This keeps the demo playable
// offline-from-credentials but still using the canonical recitation audio.
const AUDIO_BASE =
  'https://everyayah.com/data/Alafasy_128kbps';

function audioUrl(surah, ayah) {
  const s = String(surah).padStart(3, '0');
  const a = String(ayah).padStart(3, '0');
  return `${AUDIO_BASE}/${s}${a}.mp3`;
}

export const VERSES = {
  // Al-Fatihah
  '1:1': {
    verse_key: '1:1',
    text_uthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    translation:
      'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
    audio_url: audioUrl(1, 1),
    tafsir_simple:
      'We start everything we do by saying the name of Allah. He is the Most Kind to everyone, and the Most Kind to those who believe.',
  },
  '1:2': {
    verse_key: '1:2',
    text_uthmani: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
    translation: '[All] praise is [due] to Allah, Lord of the worlds.',
    audio_url: audioUrl(1, 2),
    tafsir_simple:
      'All thanks belong to Allah. He created and takes care of every world — people, animals, plants, and even things we cannot see.',
  },
  '1:3': {
    verse_key: '1:3',
    text_uthmani: 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    translation: 'The Entirely Merciful, the Especially Merciful.',
    audio_url: audioUrl(1, 3),
    tafsir_simple:
      'Allah is kind to every person and every creature, and He is extra kind to those who try to do good.',
  },
  '1:4': {
    verse_key: '1:4',
    text_uthmani: 'مَـٰلِكِ يَوْمِ ٱلدِّينِ',
    translation: 'Sovereign of the Day of Recompense.',
    audio_url: audioUrl(1, 4),
    tafsir_simple:
      'Allah is the King of the Day when every person will see what they did and be rewarded fairly.',
  },
  '1:5': {
    verse_key: '1:5',
    text_uthmani: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    translation: 'It is You we worship and You we ask for help.',
    audio_url: audioUrl(1, 5),
    tafsir_simple:
      'We worship only You, Allah, and we ask only You for help. Not statues, not stars, not anyone else.',
  },
  '1:6': {
    verse_key: '1:6',
    text_uthmani: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
    translation: 'Guide us to the straight path —',
    audio_url: audioUrl(1, 6),
    tafsir_simple:
      'Show us the right way, the path of people who please You and live good lives.',
  },
  '1:7': {
    verse_key: '1:7',
    text_uthmani:
      'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
    translation:
      'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
    audio_url: audioUrl(1, 7),
    tafsir_simple:
      'Keep us on the path of the prophets and good people You loved. Save us from the path of people who knew the truth and turned away, and from people who got lost.',
  },

  // Al-Asr
  '103:1': {
    verse_key: '103:1',
    text_uthmani: 'وَٱلْعَصْرِ',
    translation: 'By time,',
    audio_url: audioUrl(103, 1),
    tafsir_simple:
      'Allah swears by Time itself, because time is one of the most valuable things — once it is gone, it never comes back.',
  },
  '103:2': {
    verse_key: '103:2',
    text_uthmani: 'إِنَّ ٱلْإِنسَـٰنَ لَفِى خُسْرٍ',
    translation: 'Indeed, mankind is in loss,',
    audio_url: audioUrl(103, 2),
    tafsir_simple:
      'Most people are losing — they spend their time on things that will not help them later.',
  },
  '103:3': {
    verse_key: '103:3',
    text_uthmani:
      'إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ',
    translation:
      'Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.',
    audio_url: audioUrl(103, 3),
    tafsir_simple:
      'Four things save you: (1) believing in Allah, (2) doing good actions, (3) reminding friends to be honest, (4) helping each other stay patient.',
  },

  // Al-Kawthar
  '108:1': {
    verse_key: '108:1',
    text_uthmani: 'إِنَّآ أَعْطَيْنَـٰكَ ٱلْكَوْثَرَ',
    translation: 'Indeed, We have granted you, [O Muhammad], al-Kawthar.',
    audio_url: audioUrl(108, 1),
    tafsir_simple:
      'Allah gave Prophet Muhammad ﷺ Al-Kawthar — a beautiful river in Paradise and many other gifts.',
  },
  '108:2': {
    verse_key: '108:2',
    text_uthmani: 'فَصَلِّ لِرَبِّكَ وَٱنْحَرْ',
    translation: 'So pray to your Lord and sacrifice [to Him alone].',
    audio_url: audioUrl(108, 2),
    tafsir_simple:
      'When Allah gives you so much, the answer is to pray to Him and give back to others — not to brag.',
  },
  '108:3': {
    verse_key: '108:3',
    text_uthmani: 'إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ',
    translation: 'Indeed, your enemy is the one cut off.',
    audio_url: audioUrl(108, 3),
    tafsir_simple:
      'The people who hated the Prophet ﷺ were forgotten, but his name is honored every single day across the world.',
  },

  // Al-Ikhlas
  '112:1': {
    verse_key: '112:1',
    text_uthmani: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
    translation: 'Say, "He is Allah, [who is] One,',
    audio_url: audioUrl(112, 1),
    tafsir_simple:
      'Tell everyone clearly: Allah is One. Not two, not three, not many — just One.',
  },
  '112:2': {
    verse_key: '112:2',
    text_uthmani: 'ٱللَّهُ ٱلصَّمَدُ',
    translation: 'Allah, the Eternal Refuge.',
    audio_url: audioUrl(112, 2),
    tafsir_simple:
      'Everyone needs Allah, but Allah does not need anyone. Everything depends on Him.',
  },
  '112:3': {
    verse_key: '112:3',
    text_uthmani: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
    translation: 'He neither begets nor is born,',
    audio_url: audioUrl(112, 3),
    tafsir_simple:
      'Allah has no children, no parents. He is not like people or anything you can imagine.',
  },
  '112:4': {
    verse_key: '112:4',
    text_uthmani: 'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ',
    translation: 'Nor is there to Him any equivalent."',
    audio_url: audioUrl(112, 4),
    tafsir_simple: 'Nothing in the world is like Allah, and no one is His equal.',
  },

  // Al-Falaq
  '113:1': {
    verse_key: '113:1',
    text_uthmani: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ',
    translation: 'Say, "I seek refuge in the Lord of daybreak,',
    audio_url: audioUrl(113, 1),
    tafsir_simple:
      'When you feel scared, ask Allah — the One who splits the night with morning light — to keep you safe.',
  },
  '113:2': {
    verse_key: '113:2',
    text_uthmani: 'مِن شَرِّ مَا خَلَقَ',
    translation: 'From the evil of that which He created',
    audio_url: audioUrl(113, 2),
    tafsir_simple: 'Ask Allah to protect you from any harmful thing in His creation.',
  },
  '113:3': {
    verse_key: '113:3',
    text_uthmani: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
    translation: 'And from the evil of darkness when it settles',
    audio_url: audioUrl(113, 3),
    tafsir_simple:
      'And from harmful things in the dark — when scary thoughts come at night, ask Allah for help.',
  },
  '113:4': {
    verse_key: '113:4',
    text_uthmani: 'وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ',
    translation: 'And from the evil of the blowers in knots',
    audio_url: audioUrl(113, 4),
    tafsir_simple: 'And from people who try to harm others through bad magic.',
  },
  '113:5': {
    verse_key: '113:5',
    text_uthmani: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    translation: 'And from the evil of an envier when he envies."',
    audio_url: audioUrl(113, 5),
    tafsir_simple:
      'And from a jealous person when their jealousy turns into harm. Allah is your protector.',
  },

  // An-Nas
  '114:1': {
    verse_key: '114:1',
    text_uthmani: 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ',
    translation: 'Say, "I seek refuge in the Lord of mankind,',
    audio_url: audioUrl(114, 1),
    tafsir_simple:
      'I run to Allah for safety — He is the Lord of every single person.',
  },
  '114:2': {
    verse_key: '114:2',
    text_uthmani: 'مَلِكِ ٱلنَّاسِ',
    translation: 'The Sovereign of mankind,',
    audio_url: audioUrl(114, 2),
    tafsir_simple: 'He is the King of all people. No king is bigger than Him.',
  },
  '114:3': {
    verse_key: '114:3',
    text_uthmani: 'إِلَـٰهِ ٱلنَّاسِ',
    translation: 'The God of mankind,',
    audio_url: audioUrl(114, 3),
    tafsir_simple: 'He is the God of all people. He is the only one we worship.',
  },
  '114:4': {
    verse_key: '114:4',
    text_uthmani: 'مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ',
    translation: 'From the evil of the retreating whisperer —',
    audio_url: audioUrl(114, 4),
    tafsir_simple:
      'Ask Allah to protect you from the bad whispers of Shaytan that come and go.',
  },
  '114:5': {
    verse_key: '114:5',
    text_uthmani: 'ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ',
    translation: 'Who whispers [evil] into the breasts of mankind —',
    audio_url: audioUrl(114, 5),
    tafsir_simple:
      'He is the one who tries to put bad ideas into people\'s hearts.',
  },
  '114:6': {
    verse_key: '114:6',
    text_uthmani: 'مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ',
    translation: 'From among the jinn and mankind."',
    audio_url: audioUrl(114, 6),
    tafsir_simple:
      'Bad whispers can come from jinn we cannot see, or from people. Allah protects you from both.',
  },
};

// Selected words with simple meanings — used by "Word Explorer" practice.
export const WORDS = [
  {
    id: 'w_rahman',
    arabic: 'الرَّحْمَٰن',
    transliteration: 'ar-Rahman',
    meaning: 'The Most Kind to everyone',
    verses: ['1:1', '1:3'],
    theme: 'names_of_allah',
  },
  {
    id: 'w_rahim',
    arabic: 'الرَّحِيم',
    transliteration: 'ar-Rahim',
    meaning: 'The Especially Kind to believers',
    verses: ['1:1', '1:3'],
    theme: 'names_of_allah',
  },
  {
    id: 'w_rabb',
    arabic: 'رَبِّ',
    transliteration: 'Rabb',
    meaning: 'Lord, Master, Caretaker',
    verses: ['1:2', '113:1', '114:1'],
    theme: 'names_of_allah',
  },
  {
    id: 'w_alameen',
    arabic: 'الْعَالَمِينَ',
    transliteration: 'al-Alameen',
    meaning: 'All the worlds',
    verses: ['1:2'],
    theme: 'creation',
  },
  {
    id: 'w_hamd',
    arabic: 'الْحَمْدُ',
    transliteration: 'al-Hamd',
    meaning: 'All praise and thanks',
    verses: ['1:2'],
    theme: 'gratitude',
  },
  {
    id: 'w_sirat',
    arabic: 'الصِّرَاطَ',
    transliteration: 'as-Sirat',
    meaning: 'The path',
    verses: ['1:6', '1:7'],
    theme: 'guidance',
  },
  {
    id: 'w_mustaqim',
    arabic: 'الْمُسْتَقِيمَ',
    transliteration: 'al-Mustaqim',
    meaning: 'Straight, not crooked',
    verses: ['1:6'],
    theme: 'guidance',
  },
  {
    id: 'w_asr',
    arabic: 'الْعَصْرِ',
    transliteration: 'al-Asr',
    meaning: 'Time, the passing afternoon',
    verses: ['103:1'],
    theme: 'time',
  },
  {
    id: 'w_khusr',
    arabic: 'خُسْرٍ',
    transliteration: 'khusr',
    meaning: 'Loss, losing out',
    verses: ['103:2'],
    theme: 'time',
  },
  {
    id: 'w_sabr',
    arabic: 'الصَّبْرِ',
    transliteration: 'as-Sabr',
    meaning: 'Patience, staying strong',
    verses: ['103:3'],
    theme: 'character',
  },
  {
    id: 'w_haqq',
    arabic: 'الْحَقِّ',
    transliteration: 'al-Haqq',
    meaning: 'The truth',
    verses: ['103:3'],
    theme: 'character',
  },
  {
    id: 'w_ahad',
    arabic: 'أَحَدٌ',
    transliteration: 'Ahad',
    meaning: 'One, the only One',
    verses: ['112:1'],
    theme: 'tawheed',
  },
  {
    id: 'w_samad',
    arabic: 'الصَّمَدُ',
    transliteration: 'as-Samad',
    meaning: 'The One everyone needs, who needs no one',
    verses: ['112:2'],
    theme: 'tawheed',
  },
  {
    id: 'w_falaq',
    arabic: 'الْفَلَقِ',
    transliteration: 'al-Falaq',
    meaning: 'Daybreak, when night splits open',
    verses: ['113:1'],
    theme: 'protection',
  },
  {
    id: 'w_nas',
    arabic: 'النَّاسِ',
    transliteration: 'an-Nas',
    meaning: 'Mankind, all people',
    verses: ['114:1', '114:2', '114:3'],
    theme: 'protection',
  },
  {
    id: 'w_hasid',
    arabic: 'حَاسِدٍ',
    transliteration: 'hasid',
    meaning: 'A jealous person',
    verses: ['113:5'],
    theme: 'character',
  },
  {
    id: 'w_kawthar',
    arabic: 'الْكَوْثَرَ',
    transliteration: 'al-Kawthar',
    meaning: 'A great gift, a river in Paradise',
    verses: ['108:1'],
    theme: 'paradise',
  },
];

export function getVerse(verseKey) {
  return VERSES[verseKey] || null;
}

export function getSurah(id) {
  return SURAHS[id] || null;
}

export function listSurahs() {
  return Object.values(SURAHS);
}

export function listWords({ theme } = {}) {
  if (!theme) return WORDS;
  return WORDS.filter((w) => w.theme === theme);
}

export function getVersesBySurah(surahId) {
  const prefix = `${surahId}:`;
  return Object.values(VERSES)
    .filter((v) => v.verse_key.startsWith(prefix))
    .sort((a, b) => {
      const an = parseInt(a.verse_key.split(':')[1], 10);
      const bn = parseInt(b.verse_key.split(':')[1], 10);
      return an - bn;
    });
}
