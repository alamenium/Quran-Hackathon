// AyahQuest curriculum: sections → units → quests.
//
// A quest is the smallest atomic unit of learning. Each quest contains
// 5–8 questions (mini-game items). The shape is data-only so a teacher
// can extend the curriculum by editing this file.

// Question types supported by the client:
//   meaning_match     — match an Arabic word to its meaning
//   choose_meaning    — multiple-choice meaning of an Arabic word
//   listen_choose     — play audio, pick the right ayah (Arabic or translation)
//   fill_blank        — fill in a missing Arabic word in an ayah
//   order_events      — drag to reorder events in a Quranic story/ayah
//   tap_ayah_lesson   — pick which ayah teaches a given lesson
//   reflection        — open-ended; not graded, just stored
//   recite            — recite the ayah out loud, scored by the recitation API

export const SECTIONS = [
  {
    id: 'sec_meanings',
    order: 1,
    title: 'Quran Meanings Explorer',
    subtitle: 'Words you hear every day',
    color: '#58CC02',
    units: [
      {
        id: 'unit_words_daily',
        order: 1,
        title: 'Words I Hear Every Day',
        focus: 'Vocabulary from Al-Fatihah and Al-Ikhlas',
        quests: [
          {
            id: 'q_fatihah_words_1',
            order: 1,
            title: "Allah's Names: Rahman & Rahim",
            xp: 10,
            theme: 'names_of_allah',
            verses: ['1:1', '1:3'],
            questions: [
              {
                type: 'choose_meaning',
                prompt: 'What does الرَّحْمَٰن mean?',
                arabic: 'الرَّحْمَٰن',
                options: [
                  'The Most Kind to everyone',
                  'The Strong One',
                  'The Wise One',
                  'The First',
                ],
                correctIndex: 0,
                hint:
                  "Think of someone whose kindness covers EVERY creature — even the ones who don't believe.",
              },
              {
                type: 'choose_meaning',
                prompt: 'What does الرَّحِيم mean?',
                arabic: 'الرَّحِيم',
                options: [
                  'The Powerful',
                  'The Especially Kind to believers',
                  'The Knower',
                  'The Maker',
                ],
                correctIndex: 1,
                hint: 'Like a teacher who is kind to everyone, but EXTRA kind to students who try hard.',
              },
              {
                type: 'meaning_match',
                prompt: 'Match each word to its meaning',
                pairs: [
                  { arabic: 'رَبِّ', meaning: 'Lord, Caretaker' },
                  { arabic: 'الْعَالَمِينَ', meaning: 'All the worlds' },
                  { arabic: 'الْحَمْدُ', meaning: 'All praise' },
                ],
              },
              {
                type: 'listen_choose',
                prompt: 'Listen and choose what you heard',
                audio_verse_key: '1:1',
                options: [
                  { label: 'بِسْمِ اللهِ الرَّحْمَٰنِ الرَّحِيم', correct: true },
                  { label: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِين', correct: false },
                  { label: 'قُلْ هُوَ اللَّهُ أَحَد', correct: false },
                ],
              },
              {
                type: 'reflection',
                prompt:
                  'Allah is ar-Rahman to everyone. Name one way you can be kind today, even to someone you don\'t know well.',
              },
            ],
          },
          {
            id: 'q_ikhlas_oneness',
            order: 2,
            title: 'Allah is One: Surah Al-Ikhlas',
            xp: 12,
            theme: 'tawheed',
            verses: ['112:1', '112:2', '112:3', '112:4'],
            questions: [
              {
                type: 'choose_meaning',
                prompt: 'What does أَحَد mean in قُلْ هُوَ اللَّهُ أَحَد?',
                arabic: 'أَحَد',
                options: ['Many', 'One — the only One', 'Big', 'First'],
                correctIndex: 1,
                hint: 'It does NOT just mean "one of many." It means uniquely One.',
              },
              {
                type: 'choose_meaning',
                prompt: 'What does الصَّمَد mean?',
                arabic: 'الصَّمَد',
                options: [
                  'Allah is far away',
                  'Allah needs nothing, but everyone needs Him',
                  'Allah is silent',
                  'Allah is angry',
                ],
                correctIndex: 1,
                hint:
                  'Think about it: who do plants need? Sun, water. Who does the sun need? Allah made it. Allah needs… nobody.',
              },
              {
                type: 'fill_blank',
                prompt: 'Fill in the missing word',
                ayah_template: 'قُلْ هُوَ اللَّهُ ____',
                blank: 'أَحَدٌ',
                options: ['أَحَدٌ', 'الصَّمَدُ', 'يُولَدْ', 'كُفُوًا'],
              },
              {
                type: 'tap_ayah_lesson',
                prompt: 'Which ayah teaches: "Allah was never born and has no children"?',
                options: [
                  { verse_key: '112:3', correct: true },
                  { verse_key: '112:1', correct: false },
                  { verse_key: '108:1', correct: false },
                ],
              },
              {
                type: 'recite',
                prompt: 'Recite this ayah out loud',
                verse_key: '112:1',
              },
            ],
          },
        ],
      },
      {
        id: 'unit_listen_follow',
        order: 2,
        title: 'Listen and Follow',
        focus: 'Recitation training with audio + text',
        quests: [
          {
            id: 'q_listen_fatihah',
            order: 1,
            title: 'Listen and Follow Al-Fatihah',
            xp: 15,
            theme: 'recitation',
            verses: ['1:1', '1:2', '1:3', '1:4', '1:5', '1:6', '1:7'],
            mode: 'listen_follow',
            questions: [
              {
                type: 'listen_choose',
                prompt: 'Listen — which ayah did you hear?',
                audio_verse_key: '1:5',
                options: [
                  { label: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِين', correct: true },
                  { label: 'مَالِكِ يَوْمِ الدِّين', correct: false },
                  { label: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيم', correct: false },
                ],
              },
              {
                type: 'order_events',
                prompt: 'Drag the ayat into the right order',
                items: [
                  { id: 'a1', verse_key: '1:1', display: 'In the name of Allah…' },
                  { id: 'a2', verse_key: '1:2', display: 'All praise is due to Allah…' },
                  { id: 'a3', verse_key: '1:5', display: 'It is You we worship…' },
                  { id: 'a4', verse_key: '1:6', display: 'Guide us to the straight path…' },
                ],
              },
              {
                type: 'recite',
                prompt: 'Recite Al-Fatihah verse 1',
                verse_key: '1:1',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sec_themes',
    order: 2,
    title: 'Stories That Teach',
    subtitle: 'Lessons from short surahs',
    color: '#1CB0F6',
    units: [
      {
        id: 'unit_time_value',
        order: 1,
        title: 'The Value of Time',
        focus: 'Surah Al-Asr — patience, truth, good actions',
        quests: [
          {
            id: 'q_asr_lessons',
            order: 1,
            title: 'Four Things That Save You',
            xp: 12,
            theme: 'time',
            verses: ['103:1', '103:2', '103:3'],
            questions: [
              {
                type: 'choose_meaning',
                prompt:
                  'Surah Al-Asr says most people are in خُسْر. What does that mean?',
                arabic: 'خُسْرٍ',
                options: ['Joy', 'Loss', 'Sleep', 'Sickness'],
                correctIndex: 1,
                hint:
                  'Think of how you feel when you wasted a whole afternoon scrolling and got nothing done.',
              },
              {
                type: 'tap_ayah_lesson',
                prompt:
                  'Which ayah lists FOUR things that save a person from loss?',
                options: [
                  { verse_key: '103:3', correct: true },
                  { verse_key: '103:1', correct: false },
                  { verse_key: '103:2', correct: false },
                ],
              },
              {
                type: 'meaning_match',
                prompt: 'Match each Arabic word to its meaning',
                pairs: [
                  { arabic: 'الصَّبْرِ', meaning: 'Patience' },
                  { arabic: 'الْحَقِّ', meaning: 'The truth' },
                  { arabic: 'الْعَصْرِ', meaning: 'Time' },
                ],
              },
              {
                type: 'reflection',
                prompt:
                  'The surah says we should remind each other to be patient. Who in your life helps YOU stay patient?',
              },
              {
                type: 'recite',
                prompt: 'Recite Surah Al-Asr verse 1',
                verse_key: '103:1',
              },
            ],
          },
        ],
      },
      {
        id: 'unit_protection',
        order: 2,
        title: 'Allah Protects You',
        focus: 'Al-Falaq and An-Nas',
        quests: [
          {
            id: 'q_falaq_protection',
            order: 1,
            title: 'When You Feel Scared',
            xp: 12,
            theme: 'protection',
            verses: ['113:1', '113:2', '113:3', '113:5'],
            questions: [
              {
                type: 'choose_meaning',
                prompt: 'What does الْفَلَق mean?',
                arabic: 'الْفَلَقِ',
                options: [
                  'A loud sound',
                  'Daybreak — when night splits open',
                  'A storm',
                  'A mountain',
                ],
                correctIndex: 1,
                hint: 'Imagine the moment dawn cracks through the dark sky.',
              },
              {
                type: 'tap_ayah_lesson',
                prompt:
                  'Which ayah asks Allah for protection from a jealous person?',
                options: [
                  { verse_key: '113:5', correct: true },
                  { verse_key: '113:1', correct: false },
                  { verse_key: '113:3', correct: false },
                ],
              },
              {
                type: 'fill_blank',
                prompt: 'Fill in the missing word',
                ayah_template: 'قُلْ أَعُوذُ بِرَبِّ ____',
                blank: 'الْفَلَقِ',
                options: ['الْفَلَقِ', 'النَّاسِ', 'الْعَصْرِ', 'الْكَوْثَرَ'],
              },
              {
                type: 'reflection',
                prompt:
                  'When you feel scared at night, what is one thing you could say or do that this surah teaches?',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sec_reflect',
    order: 3,
    title: 'Reflect and Memorize',
    subtitle: 'Tadabbur and gentle hifz',
    color: '#CE82FF',
    units: [
      {
        id: 'unit_kawthar_gratitude',
        order: 1,
        title: 'Gratitude: Surah Al-Kawthar',
        focus: 'The shortest surah, biggest lesson',
        quests: [
          {
            id: 'q_kawthar_gratitude',
            order: 1,
            title: 'When You Get a Big Gift',
            xp: 10,
            theme: 'gratitude',
            verses: ['108:1', '108:2', '108:3'],
            questions: [
              {
                type: 'choose_meaning',
                prompt: 'What is الْكَوْثَر?',
                arabic: 'الْكَوْثَرَ',
                options: [
                  'A type of food',
                  'A great gift — and a river in Paradise',
                  'A book',
                  'A prayer',
                ],
                correctIndex: 1,
              },
              {
                type: 'tap_ayah_lesson',
                prompt:
                  'Which ayah tells us what to DO when Allah gives us blessings?',
                options: [
                  { verse_key: '108:2', correct: true },
                  { verse_key: '108:1', correct: false },
                  { verse_key: '108:3', correct: false },
                ],
              },
              {
                type: 'reflection',
                prompt:
                  'Name one big gift you have. How can you show thanks to Allah for it this week?',
              },
              {
                type: 'recite',
                prompt: 'Recite Surah Al-Kawthar verse 1',
                verse_key: '108:1',
              },
            ],
          },
        ],
      },
    ],
  },
];

// Daily Quest selection: rotates one quest per day across all units.
// Deterministic so the same user gets the same quest the same day.
export function pickDailyQuest(seedDate = new Date()) {
  const allQuests = [];
  for (const sec of SECTIONS) {
    for (const unit of sec.units) {
      for (const quest of unit.quests) {
        allQuests.push({ section: sec, unit, quest });
      }
    }
  }
  const day = Math.floor(seedDate.getTime() / (1000 * 60 * 60 * 24));
  const idx = day % allQuests.length;
  return allQuests[idx];
}

// Find a quest by id, returning section+unit+quest context.
export function findQuest(questId) {
  for (const sec of SECTIONS) {
    for (const unit of sec.units) {
      for (const quest of unit.quests) {
        if (quest.id === questId) return { section: sec, unit, quest };
      }
    }
  }
  return null;
}
