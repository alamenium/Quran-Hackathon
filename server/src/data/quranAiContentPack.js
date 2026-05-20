// ===========================================================================
// quranAiContentPack.js
//
// Source-grounded Quran content generated using the quran.ai MCP connector
// during development. Cached locally so the demo runs reliably without
// requiring live quran.ai access at runtime.
//
// Every Arabic verse text comes from quran.ai's `fetch_quran` (edition
// ar-simple-clean). Every English translation comes from `fetch_translation`
// (edition en-abdel-haleem). Every child-friendly explanation is a paraphrase
// derived from `fetch_tafsir` results in ar-muyassar and ar-saadi, written
// in plain English for ages 7+ — NOT verbatim quotes of either tafsir.
// Word morphology (root, lemma, form) comes from `fetch_word_morphology`.
//
// See server/src/data/quranAiSourceManifest.json for the per-ayah audit
// trail, and docs/quran-ai-content-pipeline.md for how to regenerate.
// ===========================================================================

const COMMON_SOURCE = {
  generatedWith: 'quran.ai',
  quranEdition: 'ar-simple-clean',
  translationEdition: 'en-abdel-haleem',
  tafsirSources: ['ar-muyassar', 'ar-saadi'],
  toolsUsed: [
    'search_quran',
    'fetch_quran',
    'fetch_translation',
    'fetch_tafsir',
    'fetch_word_morphology',
  ],
};

// ---------------------------------------------------------------------------
// New SURAHS that the pack introduces (merged into SURAHS in quranContent.js).
// ---------------------------------------------------------------------------
export const QURAN_AI_SURAHS = {
  2: {
    id: 2,
    name_arabic: 'البقرة',
    name_simple: 'Al-Baqarah',
    name_english: 'The Cow',
    revelation_place: 'madinah',
    verses_count: 286,
    bismillah_pre: true,
  },
  3: {
    id: 3,
    name_arabic: 'آل عمران',
    name_simple: 'Aal-Imran',
    name_english: 'The Family of Imran',
    revelation_place: 'madinah',
    verses_count: 200,
    bismillah_pre: true,
  },
  13: {
    id: 13,
    name_arabic: 'الرعد',
    name_simple: 'Ar-Ra\'d',
    name_english: 'The Thunder',
    revelation_place: 'madinah',
    verses_count: 43,
    bismillah_pre: true,
  },
  16: {
    id: 16,
    name_arabic: 'النحل',
    name_simple: 'An-Nahl',
    name_english: 'The Bee',
    revelation_place: 'makkah',
    verses_count: 128,
    bismillah_pre: true,
  },
  21: {
    id: 21,
    name_arabic: 'الأنبياء',
    name_simple: 'Al-Anbiya',
    name_english: 'The Prophets',
    revelation_place: 'makkah',
    verses_count: 112,
    bismillah_pre: true,
  },
  30: {
    id: 30,
    name_arabic: 'الروم',
    name_simple: 'Ar-Rum',
    name_english: 'The Romans',
    revelation_place: 'makkah',
    verses_count: 60,
    bismillah_pre: true,
  },
  41: {
    id: 41,
    name_arabic: 'فصلت',
    name_simple: 'Fussilat',
    name_english: 'Explained in Detail',
    revelation_place: 'makkah',
    verses_count: 54,
    bismillah_pre: true,
  },
  45: {
    id: 45,
    name_arabic: 'الجاثية',
    name_simple: 'Al-Jathiyah',
    name_english: 'The Kneeling',
    revelation_place: 'makkah',
    verses_count: 37,
    bismillah_pre: true,
  },
  49: {
    id: 49,
    name_arabic: 'الحجرات',
    name_simple: 'Al-Hujurat',
    name_english: 'The Private Chambers',
    revelation_place: 'madinah',
    verses_count: 18,
    bismillah_pre: true,
  },
  59: {
    id: 59,
    name_arabic: 'الحشر',
    name_simple: 'Al-Hashr',
    name_english: 'The Gathering',
    revelation_place: 'madinah',
    verses_count: 24,
    bismillah_pre: true,
  },
  67: {
    id: 67,
    name_arabic: 'الملك',
    name_simple: 'Al-Mulk',
    name_english: 'The Sovereignty',
    revelation_place: 'makkah',
    verses_count: 30,
    bismillah_pre: true,
  },
};

// EveryAyah CDN URL (same scheme used by quranContent.js).
const AUDIO_BASE = 'https://everyayah.com/data/Alafasy_128kbps';
function audioUrl(surah, ayah) {
  const s = String(surah).padStart(3, '0');
  const a = String(ayah).padStart(3, '0');
  return `${AUDIO_BASE}/${s}${a}.mp3`;
}

// ---------------------------------------------------------------------------
// VERSES — Arabic text from fetch_quran (ar-simple-clean).
// English from fetch_translation (en-abdel-haleem).
// tafsir_simple is a child-friendly paraphrase derived from the
// ar-muyassar + ar-saadi tafsir we fetched. NOT a verbatim quote.
// ---------------------------------------------------------------------------
export const QURAN_AI_VERSES = {
  // ---- Gratitude extension --------------------------------------------------
  '14:34': {
    verse_key: '14:34',
    text_uthmani:
      'وَآتَاكُم مِّن كُلِّ مَا سَأَلْتُمُوهُ ۚ وَإِن تَعُدُّوا نِعْمَتَ اللَّهِ لَا تُحْصُوهَا ۗ إِنَّ الْإِنسَانَ لَظَلُومٌ كَفَّارٌ',
    translation:
      'and given you some of everything you asked Him for. If you tried to count God\'s favours you could never calculate them: man is truly unjust and ungrateful.',
    audio_url: audioUrl(14, 34),
    tafsir_simple:
      'Allah has given you something from everything you ever asked for — sometimes with words, sometimes just by needing it. If you tried to sit and count the blessings Allah has given you, you would never finish. The air you breathe, your sight, your family, your body, your food — each one is a blessing, and each one has smaller blessings inside it. The ayah ends with a gentle warning: people often forget. Gratitude starts the moment we remember.',
    source: { ...COMMON_SOURCE, primaryAyah: '14:34' },
  },

  // ---- Who Allah Loves ------------------------------------------------------
  '3:134': {
    verse_key: '3:134',
    text_uthmani:
      'الَّذِينَ يُنفِقُونَ فِي السَّرَّاءِ وَالضَّرَّاءِ وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ ۗ وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ',
    translation:
      'who give, both in prosperity and adversity, who restrain their anger and pardon people- God loves those who do good-',
    audio_url: audioUrl(3, 134),
    tafsir_simple:
      'Allah describes the people He loves with three actions that are not always easy. First, they give — when they have a lot AND when they have only a little. Second, when something makes them angry, they hold the anger inside instead of letting it explode. Third, when someone hurts them, they forgive instead of getting back at them. Allah calls these people al-muhsineen — the doers of good — and He says clearly: He loves them.',
    source: { ...COMMON_SOURCE, primaryAyah: '3:134' },
  },
  '3:146': {
    verse_key: '3:146',
    text_uthmani:
      'وَكَأَيِّن مِّن نَّبِيٍّ قَاتَلَ مَعَهُ رِبِّيُّونَ كَثِيرٌ فَمَا وَهَنُوا لِمَا أَصَابَهُمْ فِي سَبِيلِ اللَّهِ وَمَا ضَعُفُوا وَمَا اسْتَكَانُوا ۗ وَاللَّهُ يُحِبُّ الصَّابِرِينَ',
    translation:
      'Many prophets have fought, with large bands of godly men alongside them who, in the face of their sufferings for God\'s cause, did not lose heart or weaken or surrender: God loves those who are steadfast.',
    audio_url: audioUrl(3, 146),
    tafsir_simple:
      'Many prophets faced hard times, and many believing companions stood with them through pain, tiredness, and loss. They did not give up. They did not let their hearts get small. They did not bow down to fear. That is what sabr means — staying strong on the inside even when life is hard on the outside. Allah loves those who keep going.',
    source: { ...COMMON_SOURCE, primaryAyah: '3:146' },
  },
  '3:159': {
    verse_key: '3:159',
    text_uthmani:
      'فَبِمَا رَحْمَةٍ مِّنَ اللَّهِ لِنتَ لَهُمْ ۖ وَلَوْ كُنتَ فَظًّا غَلِيظَ الْقَلْبِ لَانفَضُّوا مِنْ حَوْلِكَ ۖ فَاعْفُ عَنْهُمْ وَاسْتَغْفِرْ لَهُمْ وَشَاوِرْهُمْ فِي الْأَمْرِ ۖ فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ ۚ إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ',
    translation:
      'By an act of mercy from God, you [Prophet] were gentle in your dealings with them- had you been harsh, or hard-hearted, they would have dispersed and left you- so pardon them and ask forgiveness for them. Consult with them about matters, then, when you have decided on a course of action, put your trust in God: God loves those who put their trust in Him.',
    audio_url: audioUrl(3, 159),
    tafsir_simple:
      'Allah is reminding the Prophet ﷺ that his gentle, kind manner is itself a mercy from Allah. If he had been harsh, people would have walked away. So: forgive them, ask Allah to forgive them, and ask them their opinions before making big decisions. Then, once you have decided, put your trust in Allah — do your part, and leave the rest to Him. Allah loves people who trust Him like that.',
    source: { ...COMMON_SOURCE, primaryAyah: '3:159' },
  },
  '49:9': {
    verse_key: '49:9',
    text_uthmani:
      'وَإِن طَائِفَتَانِ مِنَ الْمُؤْمِنِينَ اقْتَتَلُوا فَأَصْلِحُوا بَيْنَهُمَا ۖ فَإِن بَغَتْ إِحْدَاهُمَا عَلَى الْأُخْرَىٰ فَقَاتِلُوا الَّتِي تَبْغِي حَتَّىٰ تَفِيءَ إِلَىٰ أَمْرِ اللَّهِ ۚ فَإِن فَاءَتْ فَأَصْلِحُوا بَيْنَهُمَا بِالْعَدْلِ وَأَقْسِطُوا ۖ إِنَّ اللَّهَ يُحِبُّ الْمُقْسِطِينَ',
    translation:
      'If two groups of the believers fight, you [believers] should try to reconcile them; if one of them is [clearly] oppressing the other, fight the oppressors until they submit to God\'s command, then make a just and even-handed reconciliation between the two of them: God loves those who are even-handed.',
    audio_url: audioUrl(49, 9),
    tafsir_simple:
      'When two groups of believers fight, Allah tells everyone else to help them make peace — fairly. The peace cannot lean toward one side just because we like them more. It must be even-handed. Allah loves al-muqsiteen — people who are even-handed when they judge between others, including in their own homes and friendships.',
    source: { ...COMMON_SOURCE, primaryAyah: '49:9' },
  },

  // ---- Quran Wonders / Signs in Creation -----------------------------------
  '2:164': {
    verse_key: '2:164',
    text_uthmani:
      'إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ وَالْفُلْكِ الَّتِي تَجْرِي فِي الْبَحْرِ بِمَا يَنفَعُ النَّاسَ وَمَا أَنزَلَ اللَّهُ مِنَ السَّمَاءِ مِن مَّاءٍ فَأَحْيَا بِهِ الْأَرْضَ بَعْدَ مَوْتِهَا وَبَثَّ فِيهَا مِن كُلِّ دَابَّةٍ وَتَصْرِيفِ الرِّيَاحِ وَالسَّحَابِ الْمُسَخَّرِ بَيْنَ السَّمَاءِ وَالْأَرْضِ لَآيَاتٍ لِّقَوْمٍ يَعْقِلُونَ',
    translation:
      'In the creation of the heavens and earth; in the alternation of night and day; in the ships that sail the seas with goods for people; in the water which God sends down from the sky to give life to the earth when it has been barren, scattering all kinds of creatures over it; in the changing of the winds and clouds that run their appointed courses between the sky and earth: there are signs in all these for those who use their minds.',
    audio_url: audioUrl(2, 164),
    tafsir_simple:
      'Allah is pointing to many things at once — the sky, the earth, day turning into night, ships floating across the sea, rain that brings dead land back to life, animals everywhere, winds blowing, clouds drifting. Each of these is an ayah — a sign — that points to the One who made it. They are obvious to anyone who actually looks and thinks. (One ayah, many signs.)',
    source: { ...COMMON_SOURCE, primaryAyah: '2:164' },
  },
  '3:190': {
    verse_key: '3:190',
    text_uthmani:
      'إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ',
    translation:
      'There truly are signs in the creation of the heavens and earth, and in the alternation of night and day, for those with understanding,',
    audio_url: audioUrl(3, 190),
    tafsir_simple:
      'The sky, the earth, the way night follows day — these are full of signs. But Allah says clearly who notices them: ulu-l-albab, people of understanding. Not just people who look — people who think about what they look at. Two people can see the same sunset; only one really sees it.',
    source: { ...COMMON_SOURCE, primaryAyah: '3:190' },
  },
  '13:3': {
    verse_key: '13:3',
    text_uthmani:
      'وَهُوَ الَّذِي مَدَّ الْأَرْضَ وَجَعَلَ فِيهَا رَوَاسِيَ وَأَنْهَارًا ۖ وَمِن كُلِّ الثَّمَرَاتِ جَعَلَ فِيهَا زَوْجَيْنِ اثْنَيْنِ ۖ يُغْشِي اللَّيْلَ النَّهَارَ ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ',
    translation:
      'it is He who spread out the earth, placed firm mountains and rivers on it, and made two of every kind of fruit; He draws the veil of night over the day. There truly are signs in this for people who reflect.',
    audio_url: audioUrl(13, 3),
    tafsir_simple:
      'Allah spread out the earth so we could live on it. He placed huge mountains to hold it steady, rivers to give us water, and pairs of every fruit — sweet and sour, big and small. Then He covers the day with night so everything can rest. People who stop and think about all of this start to see the One who designed it.',
    source: { ...COMMON_SOURCE, primaryAyah: '13:3' },
  },
  '16:12': {
    verse_key: '16:12',
    text_uthmani:
      'وَسَخَّرَ لَكُمُ اللَّيْلَ وَالنَّهَارَ وَالشَّمْسَ وَالْقَمَرَ ۖ وَالنُّجُومُ مُسَخَّرَاتٌ بِأَمْرِهِ ۗ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَعْقِلُونَ',
    translation:
      'By His command He has made the night and day, the sun, moon, and stars all of benefit to you. There truly are signs in this for those who use their reason.',
    audio_url: audioUrl(16, 12),
    tafsir_simple:
      'The night, the day, the sun, the moon, and the stars — Allah has put each one to work for you. The sun warms; the night rests you; the stars helped travellers find their way. None of them does this on its own — each one moves by Allah\'s command.',
    source: { ...COMMON_SOURCE, primaryAyah: '16:12' },
  },
  '21:33': {
    verse_key: '21:33',
    text_uthmani:
      'وَهُوَ الَّذِي خَلَقَ اللَّيْلَ وَالنَّهَارَ وَالشَّمْسَ وَالْقَمَرَ ۖ كُلٌّ فِي فَلَكٍ يَسْبَحُونَ',
    translation:
      'It is He who created night and day, the sun and the moon, each floating in its orbit.',
    audio_url: audioUrl(21, 33),
    tafsir_simple:
      'Night, day, sun, moon — Allah made them all, and each one travels in its own path (falak — like a track or orbit). They don\'t bump into each other. They don\'t stop. They float, exactly the way Allah designed.',
    source: { ...COMMON_SOURCE, primaryAyah: '21:33' },
  },
  '30:22': {
    verse_key: '30:22',
    text_uthmani:
      'وَمِنْ آيَاتِهِ خَلْقُ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافُ أَلْسِنَتِكُمْ وَأَلْوَانِكُمْ ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّلْعَالِمِينَ',
    translation:
      'Another of His signs is the creation of the heavens and earth, and the diversity of your languages and colours. There truly are signs in this for those who know.',
    audio_url: audioUrl(30, 22),
    tafsir_simple:
      'Allah lists another sign: people speak different languages, and people have different skin colours. We all started from one origin, but Allah designed all this variety on purpose. No two voices sound exactly the same. No two faces look exactly the same. The differences are an ayah — a sign — pointing to the One who designed every detail.',
    source: { ...COMMON_SOURCE, primaryAyah: '30:22' },
  },
  '41:37': {
    verse_key: '41:37',
    text_uthmani:
      'وَمِنْ آيَاتِهِ اللَّيْلُ وَالنَّهَارُ وَالشَّمْسُ وَالْقَمَرُ ۚ لَا تَسْجُدُوا لِلشَّمْسِ وَلَا لِلْقَمَرِ وَاسْجُدُوا لِلَّهِ الَّذِي خَلَقَهُنَّ إِن كُنتُمْ إِيَّاهُ تَعْبُدُونَ',
    translation:
      'The night, the day, the sun, the moon, are only a few of His signs. Do not bow down in worship to the sun or the moon, but bow down to God who created them, if it is truly Him that you worship.',
    audio_url: audioUrl(41, 37),
    tafsir_simple:
      'Allah lists the night, day, sun, and moon as signs — and then He says something important. Do not bow down to any of them. They are amazing, but they are made things. They cannot create themselves. Bow down only to the One who created them.',
    source: { ...COMMON_SOURCE, primaryAyah: '41:37' },
  },
  '45:5': {
    verse_key: '45:5',
    text_uthmani:
      'وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ وَمَا أَنزَلَ اللَّهُ مِنَ السَّمَاءِ مِن رِّزْقٍ فَأَحْيَا بِهِ الْأَرْضَ بَعْدَ مَوْتِهَا وَتَصْرِيفِ الرِّيَاحِ آيَاتٌ لِّقَوْمٍ يَعْقِلُونَ',
    translation:
      'in the alternation of night and day, in the rain God provides, sending it down from the sky and reviving the dead earth with it, and in His shifting of the winds there are signs for those who use their reason.',
    audio_url: audioUrl(45, 5),
    tafsir_simple:
      'Night turns into day. Rain falls from the sky and wakes up dry land — plants start growing again where everything was brown. Winds change direction. Each of these is rizq (provision) and each is an ayah. People who use their reason can see this happening every week, every season.',
    source: { ...COMMON_SOURCE, primaryAyah: '45:5' },
  },

  // ---- Knowing Allah Garden (new world) -------------------------------------
  '67:14': {
    verse_key: '67:14',
    text_uthmani:
      'أَلَا يَعْلَمُ مَنْ خَلَقَ وَهُوَ اللَّطِيفُ الْخَبِيرُ',
    translation:
      'How could He who created not know His own creation, when He is the Most Subtle, the All Aware?',
    audio_url: audioUrl(67, 14),
    tafsir_simple:
      'Allah is asking a very simple question. The One who made you — would He not know you? Every tiny detail, every thought, every move. He is Al-Lateef (the One who sees the smallest details, with kindness) and Al-Khabeer (the One who is deeply aware of everything happening). Nothing is hidden from Him, and He still loves us.',
    source: { ...COMMON_SOURCE, primaryAyah: '67:14' },
  },
  '59:24': {
    verse_key: '59:24',
    text_uthmani:
      'هُوَ اللَّهُ الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ ۖ لَهُ الْأَسْمَاءُ الْحُسْنَىٰ ۚ يُسَبِّحُ لَهُ مَا فِي السَّمَاوَاتِ وَالْأَرْضِ ۖ وَهُوَ الْعَزِيزُ الْحَكِيمُ',
    translation:
      'He is God: the Creator, the Originator, the Shaper. The best names belong to Him. Everything in the heavens and earth glorifies Him: He is the Almighty, the Wise.',
    audio_url: audioUrl(59, 24),
    tafsir_simple:
      'Allah gives Himself three names in this ayah. Al-Khaliq — He decides what something will be. Al-Bari\' — He brings it into existence from nothing. Al-Musawwir — He shapes it with care, giving everything its colour, size, and form. All the most beautiful names belong to Him. Even the things you cannot see — the wind, the stars, the tiny insects — are all praising Him in their own way.',
    source: { ...COMMON_SOURCE, primaryAyah: '59:24' },
  },
};

// ---------------------------------------------------------------------------
// WORD CARDS — morphology from fetch_word_morphology.
// Shape matches the WORDS array in quranContent.js so the existing
// /api/quran/words endpoint and Toolkit "Words" tab pick them up automatically.
// ---------------------------------------------------------------------------
export const QURAN_AI_WORDS = [
  {
    id: 'w_niamah',
    arabic: 'نِعْمَة',
    transliteration: 'niʿmah',
    meaning: 'A blessing — any good thing Allah gives us',
    simpleMeaning: 'a blessing from Allah',
    root: 'ن ع م',
    lemma: 'نِعْمَة',
    verses: ['14:34', '14:7'],
    theme: 'gratitude',
    level: 'beginner',
    miniGamePrompt: 'Name one niʿmah Allah has given you today.',
    relatedAyahs: ['14:7', '14:34', '16:18'],
    source: {
      generatedWith: 'quran.ai',
      tool: 'fetch_word_morphology',
      ayah: '14:34',
      rootFrequency: 140,
      verseFrequency: 128,
    },
  },
  {
    id: 'w_muhsineen',
    arabic: 'الْمُحْسِنِينَ',
    transliteration: 'al-muhsineen',
    meaning: 'The doers of good — people who do things beautifully',
    simpleMeaning: 'the doers of good',
    root: 'ح س ن',
    lemma: 'مُحْسِن',
    verbForm: 4,
    verses: ['3:134'],
    theme: 'who_allah_loves',
    level: 'beginner',
    miniGamePrompt: 'A muhsin does good even when it\'s hard. Name one example.',
    relatedAyahs: ['3:134'],
    source: {
      generatedWith: 'quran.ai',
      tool: 'fetch_word_morphology',
      ayah: '3:134',
      rootFrequency: 194,
      verseFrequency: 177,
    },
  },
  {
    id: 'w_sabireen',
    arabic: 'الصَّابِرِينَ',
    transliteration: 'as-sabireen',
    meaning: 'The patient, steadfast ones who keep going',
    simpleMeaning: 'the steadfast',
    root: 'ص ب ر',
    lemma: 'صَابِر',
    verses: ['3:146', '103:3'],
    theme: 'who_allah_loves',
    level: 'beginner',
    miniGamePrompt: 'Sabr is choosing to stay strong. When did you show sabr this week?',
    relatedAyahs: ['3:146', '103:3'],
    source: {
      generatedWith: 'quran.ai',
      tool: 'fetch_word_morphology',
      ayah: '3:146',
      rootFrequency: 103,
      verseFrequency: 93,
    },
  },
  {
    id: 'w_mutawakkileen',
    arabic: 'الْمُتَوَكِّلِينَ',
    transliteration: 'al-mutawakkileen',
    meaning: 'Those who put their trust in Allah',
    simpleMeaning: 'those who trust Allah',
    root: 'و ك ل',
    lemma: 'مُتَوَكِّل',
    verbForm: 5,
    verses: ['3:159'],
    theme: 'who_allah_loves',
    level: 'intermediate',
    miniGamePrompt: 'Tawakkul = do your part + trust Allah with the result. Name one example.',
    relatedAyahs: ['3:159'],
    source: {
      generatedWith: 'quran.ai',
      tool: 'fetch_word_morphology',
      ayah: '3:159',
      rootFrequency: 70,
      verseFrequency: 61,
    },
  },
  {
    id: 'w_muqsiteen',
    arabic: 'الْمُقْسِطِينَ',
    transliteration: 'al-muqsiteen',
    meaning: 'The even-handed — people who are fair to everyone',
    simpleMeaning: 'the fair ones',
    root: 'ق س ط',
    lemma: 'مُقْسِط',
    verbForm: 4,
    verses: ['49:9'],
    theme: 'who_allah_loves',
    level: 'intermediate',
    miniGamePrompt: 'A muqsit shares fairly even with someone they don\'t like. Why is that hard?',
    relatedAyahs: ['49:9', '5:8'],
    source: {
      generatedWith: 'quran.ai',
      tool: 'fetch_word_morphology',
      ayah: '49:9',
      rootFrequency: 25,
      verseFrequency: 22,
    },
  },
  {
    id: 'w_ayaat',
    arabic: 'آيَاتٍ',
    transliteration: 'ayaat',
    meaning: 'Signs — things in creation that point to Allah',
    simpleMeaning: 'signs',
    root: 'أ ي ي',
    lemma: 'آيَة',
    verses: ['2:164', '3:190', '13:3', '30:22', '45:5'],
    theme: 'creation',
    level: 'beginner',
    miniGamePrompt: 'Look up. Look down. Name three ayaat (signs) you can see right now.',
    relatedAyahs: ['2:164', '3:190', '45:5'],
    source: {
      generatedWith: 'quran.ai',
      tool: 'fetch_word_morphology',
      ayah: '2:164',
      rootFrequency: 382,
      verseFrequency: 353,
    },
  },
  {
    id: 'w_falak',
    arabic: 'فَلَكٍ',
    transliteration: 'falak',
    meaning: 'An orbit, a celestial track',
    simpleMeaning: 'an orbit',
    root: 'ف ل ك',
    lemma: 'فَلَك',
    verses: ['21:33', '36:40'],
    theme: 'creation',
    level: 'intermediate',
    miniGamePrompt: 'The sun and moon each have their own falak. What happens if they switch?',
    relatedAyahs: ['21:33', '36:40'],
    source: {
      generatedWith: 'quran.ai',
      tool: 'fetch_word_morphology',
      ayah: '21:33',
      rootFrequency: 25,
      verseFrequency: 25,
    },
  },
  {
    id: 'w_alsinah',
    arabic: 'أَلْسِنَتِكُمْ',
    transliteration: 'alsinatikum',
    meaning: 'Your languages — also "your tongues"',
    simpleMeaning: 'your languages',
    root: 'ل س ن',
    lemma: 'لِسَان',
    verses: ['30:22'],
    theme: 'creation',
    level: 'intermediate',
    miniGamePrompt: 'Allah designed every language. How many languages can you say "thank you" in?',
    relatedAyahs: ['30:22', '14:4'],
    source: {
      generatedWith: 'quran.ai',
      tool: 'fetch_word_morphology',
      ayah: '30:22',
      rootFrequency: 25,
      verseFrequency: 24,
    },
  },
  // ---- Knowing Allah Garden — Names of Allah word cards --------------------
  {
    id: 'w_ar_rahman',
    arabic: 'الرَّحْمَٰن',
    transliteration: 'ar-Rahman',
    meaning: 'The Most Merciful — whose mercy reaches everything',
    simpleMeaning: 'The Most Merciful',
    root: 'ر ح م',
    lemma: 'رَحْمَن',
    verses: ['1:1', '1:3'],
    theme: 'knowing_allah',
    level: 'beginner',
    miniGamePrompt: 'Name one act of mercy you saw today. Where did it come from?',
    relatedAyahs: ['1:1', '1:3', '7:156'],
    source: {
      generatedWith: 'quran.ai',
      tool: 'fetch_translation + tafsir',
      ayah: '1:1',
    },
  },
  {
    id: 'w_al_lateef',
    arabic: 'اللَّطِيف',
    transliteration: 'al-Lateef',
    meaning: 'The Most Subtle — sees the smallest details, with kindness',
    simpleMeaning: 'The Most Subtle',
    root: 'ل ط ف',
    lemma: 'لَطِيف',
    verses: ['67:14'],
    theme: 'knowing_allah',
    level: 'intermediate',
    miniGamePrompt: 'Allah notices the tiniest things. Name one tiny good thing in your day.',
    relatedAyahs: ['67:14'],
    source: {
      generatedWith: 'quran.ai',
      tool: 'fetch_translation + tafsir',
      ayah: '67:14',
    },
  },
  {
    id: 'w_al_khabeer',
    arabic: 'الْخَبِير',
    transliteration: 'al-Khabeer',
    meaning: 'The All Aware — knows what is happening, inside and out',
    simpleMeaning: 'The All Aware',
    root: 'خ ب ر',
    lemma: 'خَبِير',
    verses: ['67:14'],
    theme: 'knowing_allah',
    level: 'intermediate',
    miniGamePrompt: 'Allah is aware of everything — including thoughts. How does that feel?',
    relatedAyahs: ['67:14'],
    source: {
      generatedWith: 'quran.ai',
      tool: 'fetch_translation + tafsir',
      ayah: '67:14',
    },
  },
  {
    id: 'w_al_khaliq',
    arabic: 'الْخَالِق',
    transliteration: 'al-Khaliq',
    meaning: 'The Creator — decides what something will be',
    simpleMeaning: 'The Creator',
    root: 'خ ل ق',
    lemma: 'خَالِق',
    verses: ['59:24'],
    theme: 'knowing_allah',
    level: 'beginner',
    miniGamePrompt: 'Name three things Allah created today, just for you.',
    relatedAyahs: ['59:24'],
    source: {
      generatedWith: 'quran.ai',
      tool: 'fetch_translation + tafsir',
      ayah: '59:24',
    },
  },
  {
    id: 'w_al_musawwir',
    arabic: 'الْمُصَوِّر',
    transliteration: 'al-Musawwir',
    meaning: 'The Shaper — gives every thing its form and colour',
    simpleMeaning: 'The Shaper',
    root: 'ص و ر',
    lemma: 'مُصَوِّر',
    verses: ['59:24'],
    theme: 'knowing_allah',
    level: 'intermediate',
    miniGamePrompt: 'Look at one face in your family. Name one detail Al-Musawwir designed.',
    relatedAyahs: ['59:24'],
    source: {
      generatedWith: 'quran.ai',
      tool: 'fetch_translation + tafsir',
      ayah: '59:24',
    },
  },
];

// ---------------------------------------------------------------------------
// QUESTS — three new "worlds" worth of source-grounded content.
// Shape matches the quest objects in curriculum.js so the existing
// quest router (server/src/routes/quests.js) renders them with no changes.
// ---------------------------------------------------------------------------

// One new Gratitude quest (14:34 — Uncountable Blessings).
export const QURAN_AI_GRATITUDE_QUEST_14_34 = {
  id: 'q_grat_14_34_uncountable',
  order: 3,
  title: 'Uncountable Blessings — Ibrahim 14:34',
  xp: 15,
  theme: 'gratitude',
  verses: ['14:34'],
  words: [
    {
      arabic: 'نِعْمَتَ اللَّهِ',
      transliteration: 'niʿmata-llāh',
      root: 'ن ع م',
      meaning: 'The blessing of Allah',
      in_ayah: '"…the blessings of Allah"',
    },
    {
      arabic: 'تَعُدُّوا',
      transliteration: 'taʿuddū',
      root: 'ع د د',
      meaning: 'You (all) count',
      in_ayah: '"if you tried to count…"',
    },
    {
      arabic: 'لَا تُحْصُوهَا',
      transliteration: 'lā tuḥṣūhā',
      root: 'ح ص ي',
      meaning: 'You could not number them',
      in_ayah: '"…you could never calculate them"',
    },
  ],
  questions: [
    {
      type: 'choose_meaning',
      prompt: 'In Ibrahim 14:34, what does Allah say if we try to count His blessings?',
      options: [
        'We will count them all easily',
        'We will never be able to finish counting',
        'Only adults can count them',
        'Only angels can count them',
      ],
      correctIndex: 1,
      hint: 'إِن تَعُدُّوا نِعْمَتَ اللَّهِ لَا تُحْصُوهَا',
    },
    {
      type: 'meaning_match',
      prompt: 'Match each Arabic word to its meaning',
      pairs: [
        { arabic: 'نِعْمَة', meaning: 'A blessing' },
        { arabic: 'تَعُدُّوا', meaning: 'You count' },
        { arabic: 'لَا تُحْصُوهَا', meaning: 'You cannot number them' },
      ],
    },
  ],
  moral_scenario: {
    setup:
      'Mariam has been complaining all morning — her cereal was the wrong kind, her socks felt itchy, her brother took the good seat. She does not realise how many small good things are already in her day.',
    question: 'What is one thing Mariam can do?',
    options: [
      {
        text: 'Keep complaining — she earned it.',
        correct: false,
        feedback:
          'Complaining is normal sometimes, but if it fills the whole morning we stop seeing the blessings that are right there.',
      },
      {
        text: 'Try to list five blessings before complaining about the next thing.',
        correct: true,
        feedback:
          'That is the idea of Ibrahim 14:34 — the blessings are uncountable. Just five is enough to shift the whole day.',
      },
      {
        text: 'Ask her brother to give her the seat to feel better.',
        correct: false,
        feedback:
          'Getting what we want is fine, but the deeper habit is learning to notice what we already have.',
      },
    ],
    quran_connection:
      '"If you tried to count God\'s favours you could never calculate them." — Ibrahim 14:34',
  },
  reflection: {
    prompt:
      'List three blessings from today that you almost did not notice.',
    options: ['Something you ate', 'Someone who helped you', 'A small comfort', 'Something else…'],
    allow_custom: true,
  },
  related_ayahs: [
    { verse_key: '14:7', note: 'The promise: if you are grateful, I will increase you.' },
    { verse_key: '31:12', note: 'Gratitude is wisdom — and it benefits you.' },
  ],
  source: { ...COMMON_SOURCE, primaryAyah: '14:34' },
  asbab_al_nuzul: null,
};

// "Who Allah Loves" — 4 child-friendly cards/mini-quests.
export const QURAN_AI_WHO_ALLAH_LOVES_QUESTS = [
  // ---------- al-muhsineen (3:134) ----------
  {
    id: 'q_wal_muhsineen',
    order: 1,
    title: 'Allah Loves the Doers of Good',
    xp: 12,
    theme: 'who_allah_loves',
    trait: 'al-muhsineen',
    verses: ['3:134'],
    words: [
      {
        arabic: 'الْمُحْسِنِينَ',
        transliteration: 'al-muhsineen',
        root: 'ح س ن',
        meaning: 'The doers of good',
        in_ayah: '"…God loves those who do good"',
      },
      {
        arabic: 'الْكَاظِمِينَ الْغَيْظَ',
        transliteration: 'al-kāẓimīn al-ghayẓ',
        root: 'ك ظ م',
        meaning: 'Those who hold their anger inside',
        in_ayah: '"…who restrain their anger…"',
      },
      {
        arabic: 'الْعَافِينَ',
        transliteration: 'al-ʿāfīn',
        root: 'ع ف و',
        meaning: 'Those who forgive',
        in_ayah: '"…and pardon people"',
      },
    ],
    questions: [
      {
        type: 'choose_meaning',
        prompt: 'What three actions does Allah list before saying He loves the muhsineen?',
        options: [
          'Reading, writing, and arithmetic',
          'Giving in good times AND hard times, holding anger inside, and forgiving people',
          'Praying, fasting, and giving zakat',
          'Sleeping early, eating well, and exercising',
        ],
        correctIndex: 1,
        hint: 'Look at Aal-Imran 3:134 carefully — there are three actions.',
      },
    ],
    moral_scenario: {
      setup:
        'Yusuf\'s little sister broke his favourite Lego model. He feels anger rising in his chest. She is crying and saying sorry.',
      question: 'What is the muhsin response?',
      options: [
        {
          text: 'Yell at her so she learns her lesson.',
          correct: false,
          feedback:
            'Yelling lets the anger out — but Aal-Imran 3:134 mentions "holding the anger inside" as the trait Allah loves.',
        },
        {
          text: 'Hold the anger inside, forgive her, and rebuild the Lego together.',
          correct: true,
          feedback:
            'That is exactly the three actions in the ayah — restraining anger, forgiving, and doing good. That is ihsan.',
        },
        {
          text: 'Break one of her toys so she knows how it feels.',
          correct: false,
          feedback:
            'That is the opposite of ihsan. Allah loves the doers of good, not the doers of even.',
        },
      ],
      quran_connection:
        '"…who restrain their anger and pardon people — God loves those who do good." — Aal-Imran 3:134',
    },
    reflection: {
      prompt:
        'Think of one moment this week when someone made you angry. What would a muhsin have done?',
      options: ['Held the anger', 'Forgiven them', 'Done something good back', 'Something else…'],
      allow_custom: true,
    },
    related_ayahs: [
      { verse_key: '3:159', note: 'Gentleness is mercy from Allah — the prophetic example of ihsan.' },
      { verse_key: '49:9', note: 'Justice is also a kind of ihsan.' },
    ],
    source: { ...COMMON_SOURCE, primaryAyah: '3:134' },
  },

  // ---------- as-sabireen (3:146) ----------
  {
    id: 'q_wal_sabireen',
    order: 2,
    title: 'Allah Loves the Steadfast',
    xp: 12,
    theme: 'who_allah_loves',
    trait: 'as-sabireen',
    verses: ['3:146'],
    words: [
      {
        arabic: 'الصَّابِرِينَ',
        transliteration: 'as-sabireen',
        root: 'ص ب ر',
        meaning: 'The steadfast, patient ones',
        in_ayah: '"…God loves those who are steadfast"',
      },
      {
        arabic: 'مَا وَهَنُوا',
        transliteration: 'mā wahanū',
        root: 'و ه ن',
        meaning: 'They did not lose heart',
        in_ayah: '"…did not lose heart…"',
      },
    ],
    questions: [
      {
        type: 'choose_meaning',
        prompt: 'In Aal-Imran 3:146, what did the believers NOT do when hard times came?',
        options: [
          'They did not eat, did not drink, did not sleep',
          'They did not lose heart, did not weaken, did not surrender',
          'They did not pray, did not fast, did not give zakat',
          'They did not run, did not jump, did not climb',
        ],
        correctIndex: 1,
      },
    ],
    moral_scenario: {
      setup:
        'Hana has been practising the violin for months. Her recital went badly today — her fingers slipped and she heard people whisper. She feels like quitting completely.',
      question: 'What does a sabir do here?',
      options: [
        {
          text: 'Quit immediately so she never feels that again.',
          correct: false,
          feedback:
            'Sabr does not mean ignoring the pain — it means not letting the pain stop you from getting up again.',
        },
        {
          text: 'Cry today, rest, and pick up the violin again tomorrow.',
          correct: true,
          feedback:
            'That is sabr. The ayah says they did not lose heart — they felt pain, and they kept going.',
        },
        {
          text: 'Pretend the recital never happened.',
          correct: false,
          feedback:
            'Pretending hides the feeling but doesn\'t build strength. Sabr looks at the hard thing and stays standing.',
        },
      ],
      quran_connection:
        '"…they did not lose heart or weaken or surrender: God loves those who are steadfast." — Aal-Imran 3:146',
    },
    reflection: {
      prompt:
        'Name one hard thing right now in your life that needs sabr. What is one small step you can take this week?',
      options: ['A subject at school', 'A skill you are learning', 'A friendship', 'Something else…'],
      allow_custom: true,
    },
    related_ayahs: [
      { verse_key: '103:3', note: 'Patience is one of four things that save us.' },
    ],
    source: { ...COMMON_SOURCE, primaryAyah: '3:146' },
  },

  // ---------- al-mutawakkileen (3:159) ----------
  {
    id: 'q_wal_mutawakkileen',
    order: 3,
    title: 'Allah Loves Those Who Trust Him',
    xp: 12,
    theme: 'who_allah_loves',
    trait: 'al-mutawakkileen',
    verses: ['3:159'],
    words: [
      {
        arabic: 'الْمُتَوَكِّلِينَ',
        transliteration: 'al-mutawakkileen',
        root: 'و ك ل',
        meaning: 'Those who put their trust in Allah',
        in_ayah: '"…God loves those who put their trust in Him"',
      },
      {
        arabic: 'شَاوِرْهُمْ',
        transliteration: 'shāwirhum',
        root: 'ش و ر',
        meaning: 'Consult with them (ask their opinion)',
        in_ayah: '"…consult with them about matters…"',
      },
    ],
    questions: [
      {
        type: 'choose_meaning',
        prompt: 'In Aal-Imran 3:159, what does Allah tell the Prophet ﷺ to do BEFORE relying on Allah?',
        options: [
          'Sleep and wake up early',
          'Forgive, ask forgiveness for them, consult them, decide',
          'Memorise more Quran',
          'Ignore his companions',
        ],
        correctIndex: 1,
        hint: 'There are several steps before "put your trust in God" in the ayah.',
      },
    ],
    moral_scenario: {
      setup:
        'Omar has a big maths test tomorrow. He has already studied a lot. He is now lying in bed worrying — what if he forgets everything, what if the questions are weird, what if…',
      question: 'What does tawakkul look like here?',
      options: [
        {
          text: 'Stop studying altogether — Allah will take care of it.',
          correct: false,
          feedback:
            'Tawakkul is not "do nothing". The ayah says: decide on a plan, take action, THEN trust Allah.',
        },
        {
          text: 'He already studied. Now he sleeps, says bismillah in the morning, and trusts Allah with the result.',
          correct: true,
          feedback:
            'That is tawakkul — doing your part, then handing the result to Allah. Allah loves people who do this.',
        },
        {
          text: 'Stay up all night worrying so Allah sees how serious he is.',
          correct: false,
          feedback:
            'Worry is not the same as effort. Allah does not need our worry — He wants our trust.',
        },
      ],
      quran_connection:
        '"…when you have decided on a course of action, put your trust in God: God loves those who put their trust in Him." — Aal-Imran 3:159',
    },
    reflection: {
      prompt:
        'Think of one thing you are worried about. What is your part to do? What part belongs to Allah?',
      options: ['Studies', 'A friendship', 'Something at home', 'Something else…'],
      allow_custom: true,
    },
    related_ayahs: [
      { verse_key: '3:134', note: 'Gentleness and forgiveness — another trait Allah loves.' },
    ],
    source: { ...COMMON_SOURCE, primaryAyah: '3:159' },
  },

  // ---------- al-muqsiteen (49:9) ----------
  {
    id: 'q_wal_muqsiteen',
    order: 4,
    title: 'Allah Loves the Even-Handed',
    xp: 12,
    theme: 'who_allah_loves',
    trait: 'al-muqsiteen',
    verses: ['49:9'],
    words: [
      {
        arabic: 'الْمُقْسِطِينَ',
        transliteration: 'al-muqsiteen',
        root: 'ق س ط',
        meaning: 'Those who are fair and even-handed',
        in_ayah: '"…God loves those who are even-handed"',
      },
      {
        arabic: 'فَأَصْلِحُوا',
        transliteration: 'fa-aṣliḥū',
        root: 'ص ل ح',
        meaning: 'So make peace between them',
        in_ayah: '"…you should try to reconcile them…"',
      },
    ],
    questions: [
      {
        type: 'choose_meaning',
        prompt: 'In Al-Hujurat 49:9, when two believers fight, what does Allah say others should do?',
        options: [
          'Pick a side and help them win',
          'Try to make peace between them — even-handedly',
          'Ignore them until they stop',
          'Run away from both',
        ],
        correctIndex: 1,
      },
    ],
    moral_scenario: {
      setup:
        'Your two friends Layla and Aisha had a big fight. Layla is your closer friend. Aisha says Layla started it. Layla says Aisha started it. Both want you to take their side.',
      question: 'What does a muqsit do?',
      options: [
        {
          text: 'Take Layla\'s side — she\'s your closer friend.',
          correct: false,
          feedback:
            'Al-Hujurat 49:9 says "make a just and even-handed reconciliation". Being closer to one friend does not make her right.',
        },
        {
          text: 'Listen to both fairly, and gently help them make peace.',
          correct: true,
          feedback:
            'That is qist. Even-handed. Allah loves people who are fair even when it would be easier to lean toward someone they love.',
        },
        {
          text: 'Refuse to talk to either of them.',
          correct: false,
          feedback:
            'The ayah says "try to reconcile them" — not run away. A muqsit steps in to help.',
        },
      ],
      quran_connection:
        '"…make a just and even-handed reconciliation between the two of them: God loves those who are even-handed." — Al-Hujurat 49:9',
    },
    reflection: {
      prompt:
        'Name one place in your life where it is hard to be fair (maybe with a sibling or a close friend). Why is it hard?',
      options: ['Siblings', 'Friends', 'In a game', 'Something else…'],
      allow_custom: true,
    },
    related_ayahs: [
      { verse_key: '3:134', note: 'Forgiving and giving — ihsan and qist often appear together.' },
    ],
    source: { ...COMMON_SOURCE, primaryAyah: '49:9' },
  },
];

// "Quran Wonders / Signs Detective" — 3 mini-quests.
export const QURAN_AI_WONDERS_QUESTS = [
  // ---------- Quest 1: Signs Detective ----------
  {
    id: 'q_wonders_signs_detective',
    order: 1,
    title: 'Signs Detective',
    xp: 12,
    theme: 'signs_in_creation',
    verses: ['2:164', '3:190', '41:37'],
    words: [
      {
        arabic: 'آيَاتٍ',
        transliteration: 'ayaat',
        root: 'أ ي ي',
        meaning: 'Signs',
        in_ayah: '"…there are signs in all these…"',
      },
      {
        arabic: 'أُولِي الْأَلْبَابِ',
        transliteration: 'ulu-l-albāb',
        root: 'ل ب ب',
        meaning: 'People of understanding (people who think)',
        in_ayah: '"…signs for those with understanding"',
      },
    ],
    questions: [
      {
        type: 'choose_meaning',
        prompt: 'In Aal-Imran 3:190, signs in creation are for…',
        options: [
          'Only prophets',
          'People who think (ulu-l-albab)',
          'Only adults',
          'Only scientists',
        ],
        correctIndex: 1,
        hint: 'لِأُولِي الْأَلْبَابِ — for people with lubb (a thinking heart).',
      },
      {
        type: 'choose_meaning',
        prompt: 'Fussilat 41:37 lists the sun and moon as signs — and then warns us NOT to do what?',
        options: [
          'Look at them',
          'Use them for telling time',
          'Bow down to them — bow down only to the One who made them',
          'Touch the sun',
        ],
        correctIndex: 2,
      },
    ],
    moral_scenario: {
      setup:
        'You and your cousin are watching a beautiful sunset. Your cousin says, "Nature is just nature — it just happens." You think for a second…',
      question: 'What does a "signs detective" notice?',
      options: [
        {
          text: 'Agree — it\'s just nature, just luck.',
          correct: false,
          feedback:
            'The Quran calls every sunset an ayah — a sign pointing to Someone who designed it.',
        },
        {
          text: 'Notice that the colours, the timing, the rotating earth — all of it was designed, not random.',
          correct: true,
          feedback:
            'That\'s exactly what 2:164 and 3:190 say. Signs all around — for those who think.',
        },
        {
          text: 'Argue loudly with your cousin until they agree.',
          correct: false,
          feedback:
            'Allah invites people gently. You can share what you see without forcing anyone.',
        },
      ],
      quran_connection:
        '"There truly are signs in the creation of the heavens and earth… for those with understanding." — Aal-Imran 3:190',
    },
    reflection: {
      prompt:
        'Go outside (or look out a window). Name three "ayaat" you can see right now. (Hint: clouds, trees, your own hands…)',
      options: ['The sky', 'A plant', 'An animal', 'Something else…'],
      allow_custom: true,
    },
    related_ayahs: [
      { verse_key: '2:164', note: 'Many signs in one ayah — heavens, sea, rain, winds, animals.' },
      { verse_key: '45:5', note: 'Day, night, rain, winds — signs for people who use their reason.' },
    ],
    source: { ...COMMON_SOURCE, primaryAyah: '3:190' },
  },

  // ---------- Quest 2: Match the Sign to the Ayah ----------
  {
    id: 'q_wonders_match_sign',
    order: 2,
    title: 'Match the Sign to the Ayah',
    xp: 12,
    theme: 'signs_in_creation',
    verses: ['13:3', '16:12', '21:33'],
    words: [
      {
        arabic: 'فَلَكٍ',
        transliteration: 'falak',
        root: 'ف ل ك',
        meaning: 'An orbit — a track the sun and moon travel on',
        in_ayah: '"…each floating in its orbit"',
      },
      {
        arabic: 'سَخَّرَ',
        transliteration: 'sakhkhara',
        root: 'س خ ر',
        meaning: 'He made (something) useful for us',
        in_ayah: '"…He has made the night and day… of benefit to you"',
      },
    ],
    questions: [
      {
        type: 'meaning_match',
        prompt: 'Match each sign to its ayah',
        pairs: [
          { arabic: 'Mountains, rivers, pairs of fruits', meaning: '13:3' },
          { arabic: 'Sun and moon each floating in an orbit (falak)', meaning: '21:33' },
          { arabic: 'Night, day, sun, moon, stars all serving us', meaning: '16:12' },
        ],
      },
      {
        type: 'choose_meaning',
        prompt: 'In Al-Anbiya 21:33, the sun and moon are each…',
        options: [
          'Standing still in the sky',
          'Floating in their own orbit (falak)',
          'Bumping into each other',
          'Going wherever they want',
        ],
        correctIndex: 1,
      },
    ],
    moral_scenario: {
      setup:
        'In science class, the teacher says the planets travel in orbits. Layla remembers a Quran ayah from a year ago…',
      question: 'Which ayah is it?',
      options: [
        {
          text: 'Al-Anbiya 21:33 — "each floating in its orbit (falak)".',
          correct: true,
          feedback:
            'Yes — the Quran uses the word falak for orbit. The same Allah who told us about ayaat in the Quran designed the orbits in space.',
        },
        {
          text: 'Al-Fatihah 1:1 — Bismillah.',
          correct: false,
          feedback:
            'Al-Fatihah is about beginnings — Al-Anbiya 21:33 is the one about orbits.',
        },
        {
          text: 'Al-Ikhlas 112:1 — Allah is One.',
          correct: false,
          feedback:
            'Al-Ikhlas is about Allah\'s oneness. The ayah about orbits is Al-Anbiya 21:33.',
        },
      ],
      quran_connection:
        '"…each floating in its orbit." — Al-Anbiya 21:33',
    },
    reflection: {
      prompt:
        'Which "sign" surprises you the most — mountains, rivers, fruit pairs, sun and moon in orbits, or something else?',
      options: ['Mountains', 'Rivers', 'Orbits of sun and moon', 'Something else…'],
      allow_custom: true,
    },
    related_ayahs: [
      { verse_key: '16:12', note: 'Night, day, sun, moon, stars all serving us.' },
      { verse_key: '41:37', note: 'Same signs — but worship only the One who made them.' },
    ],
    source: { ...COMMON_SOURCE, primaryAyah: '21:33' },
  },

  // ---------- Quest 3: What Did You Notice Today? ----------
  {
    id: 'q_wonders_what_i_noticed',
    order: 3,
    title: 'What Did You Notice Today?',
    xp: 10,
    theme: 'signs_in_creation',
    verses: ['30:22', '45:5'],
    words: [
      {
        arabic: 'أَلْسِنَتِكُمْ',
        transliteration: 'alsinatikum',
        root: 'ل س ن',
        meaning: 'Your languages (also "your tongues")',
        in_ayah: '"…the diversity of your languages…"',
      },
      {
        arabic: 'أَلْوَانِكُمْ',
        transliteration: 'alwānikum',
        root: 'ل و ن',
        meaning: 'Your colours',
        in_ayah: '"…and colours"',
      },
    ],
    questions: [
      {
        type: 'choose_meaning',
        prompt: 'Ar-Rum 30:22 lists which two human "signs"?',
        options: [
          'How tall and how short people are',
          'Languages and colours',
          'How fast and how slow people walk',
          'Names and addresses',
        ],
        correctIndex: 1,
        hint: 'أَلْسِنَتِكُمْ وَأَلْوَانِكُمْ',
      },
    ],
    moral_scenario: {
      setup:
        'A new student joins your class. She speaks a language you don\'t know and looks different from anyone else there. Some kids whisper about her.',
      question: 'What does Ar-Rum 30:22 teach you here?',
      options: [
        {
          text: 'The differences are a sign of Allah — not a reason to make fun of anyone.',
          correct: true,
          feedback:
            'Exactly. Ar-Rum 30:22 calls the differences in language and colour ayaat — signs. Signs are meant to be respected.',
        },
        {
          text: 'Stick with people who look like you.',
          correct: false,
          feedback:
            'The ayah goes the other direction — the differences are a sign of Allah\'s design.',
        },
        {
          text: 'Ignore her completely.',
          correct: false,
          feedback:
            'A "signs detective" would do the opposite — go say salam.',
        },
      ],
      quran_connection:
        '"…the diversity of your languages and colours. There truly are signs in this for those who know." — Ar-Rum 30:22',
    },
    reflection: {
      prompt:
        'Write one thing you noticed today that you think is an ayah — a sign of Allah.',
      options: ['Something in the sky', 'Something in a person', 'Something in nature', 'Something else…'],
      allow_custom: true,
    },
    related_ayahs: [
      { verse_key: '2:164', note: 'Many signs together — wind, water, animals.' },
    ],
    source: { ...COMMON_SOURCE, primaryAyah: '30:22' },
  },
];

// ---------------------------------------------------------------------------
// SECTIONS — two new top-level sections plus the new gratitude quest hook.
// ---------------------------------------------------------------------------

// Knowing Allah Garden — vertical slice for the curriculum restructure.
// 3 quests using verses verified through quran.ai:
//   1. Allah is Merciful   → 1:1 (Bismillah; Ar-Rahman, Ar-Rahim)
//   2. Allah Knows & Sees  → 67:14 (Al-Lateef, Al-Khabeer)
//   3. Allah Creates       → 59:24 (Al-Khaliq, Al-Bari, Al-Musawwir)
// Following the brief's "no ayah-number-only exercises" rule, every prompt
// shows the actual Arabic + English text, not just the reference.
export const QURAN_AI_KNOWING_ALLAH_QUESTS = [
  {
    id: 'q_knowing_merciful',
    order: 1,
    title: 'Allah is Merciful',
    xp: 12,
    theme: 'knowing_allah',
    trait: 'ar-rahman-ar-rahim',
    verses: ['1:1'],
    words: [
      {
        arabic: 'الرَّحْمَٰنِ',
        transliteration: 'ar-Rahman',
        root: 'ر ح م',
        meaning: 'The Most Merciful — whose mercy fills everything',
        in_ayah: '"…the Lord of Mercy…"',
      },
      {
        arabic: 'الرَّحِيمِ',
        transliteration: 'ar-Rahim',
        root: 'ر ح م',
        meaning: 'The Giver of Mercy — specially to the believers',
        in_ayah: '"…the Giver of Mercy."',
      },
    ],
    questions: [
      {
        type: 'choose_meaning',
        prompt:
          'You just heard "Bismillah ir-Rahman ir-Rahim." Which name teaches us that Allah\'s mercy reaches everyone — believers AND non-believers, animals AND plants?',
        options: [
          'Ar-Rahman',
          'Al-Aziz',
          'Al-Khaliq',
          'Al-Hakim',
        ],
        correctIndex: 0,
        hint: 'الرَّحْمَٰن — wide, all-reaching mercy.',
      },
      {
        type: 'meaning_match',
        prompt: 'Match each Name of Allah to its meaning',
        pairs: [
          { arabic: 'الرَّحْمَٰن', meaning: 'Mercy for all creation' },
          { arabic: 'الرَّحِيم', meaning: 'Special mercy for believers' },
        ],
      },
    ],
    moral_scenario: {
      setup:
        'Ali sees a stray cat that looks hungry and tired. He has half a sandwich in his bag.',
      question: 'How does a child of Ar-Rahman act here?',
      options: [
        {
          text: 'Walk past — it\'s just an animal.',
          correct: false,
          feedback:
            'Allah\'s mercy reaches every creature. We learn from Ar-Rahman by showing mercy back.',
        },
        {
          text: 'Give the cat some of the sandwich.',
          correct: true,
          feedback:
            'That\'s what Ar-Rahman teaches us. The mercy we receive, we pass on.',
        },
        {
          text: 'Take a photo and post it online.',
          correct: false,
          feedback:
            'A photo doesn\'t feed a hungry cat. Mercy is action, not just feelings.',
        },
      ],
      quran_connection: '"In the name of God, the Lord of Mercy, the Giver of Mercy!" — Al-Fatihah 1:1',
    },
    reflection: {
      prompt: 'Name one moment today when YOU received mercy. From whom?',
      options: ['A parent', 'A friend', 'A teacher', 'Allah directly', 'Something else…'],
      allow_custom: true,
    },
    related_ayahs: [
      { verse_key: '67:14', note: 'Allah is Al-Lateef — kind even in His knowledge of us.' },
    ],
    source: { ...COMMON_SOURCE, primaryAyah: '1:1' },
  },

  {
    id: 'q_knowing_aware',
    order: 2,
    title: 'Allah Knows and Sees',
    xp: 12,
    theme: 'knowing_allah',
    trait: 'al-lateef-al-khabeer',
    verses: ['67:14'],
    words: [
      {
        arabic: 'يَعْلَمُ',
        transliteration: 'yaʿlam',
        root: 'ع ل م',
        meaning: 'He knows',
        in_ayah: '"How could He who created not know…"',
      },
      {
        arabic: 'اللَّطِيفُ',
        transliteration: 'al-Lateef',
        root: 'ل ط ف',
        meaning: 'The Most Subtle — sees the smallest details, with kindness',
        in_ayah: '"…when He is the Most Subtle…"',
      },
      {
        arabic: 'الْخَبِيرُ',
        transliteration: 'al-Khabeer',
        root: 'خ ب ر',
        meaning: 'The All Aware — knows what is happening, inside and out',
        in_ayah: '"…the All Aware?"',
      },
    ],
    questions: [
      {
        type: 'choose_meaning',
        prompt:
          'You just read: "How could He who created not know His own creation?" What is Allah saying about Himself here?',
        options: [
          'He knows everything He made — He is Al-Lateef and Al-Khabeer',
          'He forgets sometimes',
          'He only knows the big things',
          'He knows only what we tell Him',
        ],
        correctIndex: 0,
        hint: 'أَلَا يَعْلَمُ مَنْ خَلَقَ — would the Creator not know?',
      },
      {
        type: 'meaning_match',
        prompt: 'Match each Name of Allah to its meaning',
        pairs: [
          { arabic: 'اللَّطِيف', meaning: 'Sees the smallest details, kindly' },
          { arabic: 'الْخَبِير', meaning: 'Aware of everything, inside and out' },
        ],
      },
    ],
    moral_scenario: {
      setup:
        'Maryam takes a cookie she wasn\'t supposed to. Nobody saw — Mum is upstairs and there are no cameras.',
      question: 'What does knowing about Al-Khabeer change?',
      options: [
        {
          text: 'Nothing — nobody saw, so it doesn\'t count.',
          correct: false,
          feedback:
            'Al-Khabeer means Allah is aware. "Nobody saw" is never true with Allah.',
        },
        {
          text: 'Allah saw. Maryam can put it back or tell Mum.',
          correct: true,
          feedback:
            'Right. Knowing that Al-Khabeer is aware is a gift — it helps us choose better, even when no human is watching.',
        },
        {
          text: 'Eat it quickly so the evidence disappears.',
          correct: false,
          feedback:
            'You can hide it from Mum, but never from Al-Khabeer. He is aware always.',
        },
      ],
      quran_connection:
        '"How could He who created not know His own creation, when He is the Most Subtle, the All Aware?" — Al-Mulk 67:14',
    },
    reflection: {
      prompt:
        'Pick one small action today that you did when "nobody was watching." Did knowing Allah is Al-Khabeer change anything for you?',
      options: ['At home', 'At school', 'With friends', 'Something else…'],
      allow_custom: true,
    },
    related_ayahs: [
      { verse_key: '59:24', note: 'The Creator who knows — and who shapes everything.' },
    ],
    source: { ...COMMON_SOURCE, primaryAyah: '67:14' },
  },

  {
    id: 'q_knowing_creator',
    order: 3,
    title: 'Allah Creates and Shapes',
    xp: 12,
    theme: 'knowing_allah',
    trait: 'al-khaliq-al-bari-al-musawwir',
    verses: ['59:24'],
    words: [
      {
        arabic: 'الْخَالِقُ',
        transliteration: 'al-Khaliq',
        root: 'خ ل ق',
        meaning: 'The Creator — decides what something will be',
        in_ayah: '"…the Creator…"',
      },
      {
        arabic: 'الْبَارِئُ',
        transliteration: 'al-Bari\'',
        root: 'ب ر أ',
        meaning: 'The Originator — brings it into existence from nothing',
        in_ayah: '"…the Originator…"',
      },
      {
        arabic: 'الْمُصَوِّرُ',
        transliteration: 'al-Musawwir',
        root: 'ص و ر',
        meaning: 'The Shaper — gives every thing its form and colour',
        in_ayah: '"…the Shaper…"',
      },
    ],
    questions: [
      {
        type: 'choose_meaning',
        prompt:
          'You just read Surat Al-Hashr 59:24. It mentions THREE creation-related Names of Allah. Which one shapes everything\'s colour, size, and form?',
        options: [
          'Al-Khaliq',
          'Al-Bari\'',
          'Al-Musawwir',
          'Al-Aziz',
        ],
        correctIndex: 2,
        hint: 'الْمُصَوِّر — Allah designs every face, every flower, every snowflake differently.',
      },
      {
        type: 'meaning_match',
        prompt: 'Match each Name to its meaning',
        pairs: [
          { arabic: 'الْخَالِق', meaning: 'Decides what something will be' },
          { arabic: 'الْبَارِئ', meaning: 'Brings it into existence' },
          { arabic: 'الْمُصَوِّر', meaning: 'Gives it its shape and colour' },
        ],
      },
    ],
    moral_scenario: {
      setup:
        'Yusuf doesn\'t like his nose. He saw a picture of an actor and wishes his nose looked like that. He feels sad.',
      question: 'What does knowing Al-Musawwir tell him?',
      options: [
        {
          text: 'Allah chose his nose, exactly. That choice is from Al-Musawwir.',
          correct: true,
          feedback:
            'Beautiful. Al-Musawwir designs every face on purpose. No two are the same. Yours was chosen for you.',
        },
        {
          text: 'He should be sad — actors look nicer.',
          correct: false,
          feedback:
            'Allah designed every face differently. Your face was shaped by Al-Musawwir, the same Allah who shapes flowers and stars.',
        },
        {
          text: 'Hide his face so nobody sees.',
          correct: false,
          feedback:
            'Don\'t hide what Allah designed. He gave you the face He wanted you to have.',
        },
      ],
      quran_connection:
        '"He is God: the Creator, the Originator, the Shaper. The best names belong to Him." — Al-Hashr 59:24',
    },
    reflection: {
      prompt:
        'Look at your hands. Name three things about them that Allah designed — and one thing that surprises you about them.',
      options: ['Your fingerprints', 'Your skin colour', 'How they bend', 'Something else…'],
      allow_custom: true,
    },
    related_ayahs: [
      { verse_key: '1:1', note: 'The Creator is also Ar-Rahman — He created out of mercy.' },
      { verse_key: '67:14', note: 'The Creator knows His creation perfectly.' },
    ],
    source: { ...COMMON_SOURCE, primaryAyah: '59:24' },
  },
];

// ---------------------------------------------------------------------------
// SECTIONS — top-level worlds.
// ---------------------------------------------------------------------------
export const QURAN_AI_SECTIONS = [
  {
    id: 'sec_knowing_allah',
    order: 3,
    title: 'Knowing Allah Garden',
    subtitle: 'Meet Allah through His Names and ayahs',
    color: '#FFB020',
    units: [
      {
        id: 'unit_knowing_allah_core',
        order: 1,
        title: 'Who is Allah?',
        focus: 'Three Names of Allah from three ayahs, each verified through quran.ai',
        quests: QURAN_AI_KNOWING_ALLAH_QUESTS,
      },
    ],
    source: { ...COMMON_SOURCE, sectionTheme: 'knowing_allah' },
  },
  {
    id: 'sec_who_allah_loves',
    order: 4,
    title: 'Who Allah Loves',
    subtitle: 'Four traits the Quran says Allah loves',
    color: '#A56EFF',
    units: [
      {
        id: 'unit_who_allah_loves_core',
        order: 1,
        title: 'Allah Loves…',
        focus: 'Four child-friendly "Allah loves the ___" ayahs',
        quests: QURAN_AI_WHO_ALLAH_LOVES_QUESTS,
      },
    ],
    source: { ...COMMON_SOURCE, sectionTheme: 'who_allah_loves' },
  },
  {
    id: 'sec_quran_wonders',
    order: 5,
    title: 'Quran Wonders — Signs Detective',
    subtitle: 'Tap what Allah tells us to notice',
    color: '#2BB673',
    units: [
      {
        id: 'unit_wonders_core',
        order: 1,
        title: 'Signs Around Us',
        focus: 'Three mini quests on the signs of Allah in creation',
        quests: QURAN_AI_WONDERS_QUESTS,
      },
    ],
    source: { ...COMMON_SOURCE, sectionTheme: 'signs_in_creation' },
  },
];

// Convenience exports
export { COMMON_SOURCE };
