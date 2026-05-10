// Placement test — assigns the user a starting section based on score.
// Light, fast (~6 questions), but actually informative.

export const DIAGNOSTIC_QUESTIONS = [
  {
    id: 'd1',
    type: 'choose_meaning',
    prompt: 'What does الرَّحْمَٰن (ar-Rahman) mean?',
    arabic: 'الرَّحْمَٰن',
    options: [
      'The Most Kind to everyone',
      'The Powerful King',
      'The Hidden One',
      'I don\'t know yet',
    ],
    correctIndex: 0,
    weight: 1,
  },
  {
    id: 'd2',
    type: 'choose_meaning',
    prompt: 'What does الصَّمَد mean?',
    arabic: 'الصَّمَد',
    options: [
      'The Eternal — needs no one, but everyone needs Him',
      'The First',
      'The Tall One',
      'I don\'t know yet',
    ],
    correctIndex: 0,
    weight: 2,
  },
  {
    id: 'd3',
    type: 'tap_ayah_lesson',
    prompt:
      'Which surah teaches us to ask Allah for protection at daybreak?',
    options: [
      { label: 'Al-Falaq (113)', correct: true },
      { label: 'Al-Kawthar (108)', correct: false },
      { label: 'Al-Asr (103)', correct: false },
      { label: 'I don\'t know yet', correct: false },
    ],
    weight: 2,
  },
  {
    id: 'd4',
    type: 'choose_meaning',
    prompt:
      'In Surah Al-Asr, Allah swears by الْعَصْر. What does it mean?',
    arabic: 'الْعَصْرِ',
    options: ['Time', 'A mountain', 'A person', 'I don\'t know yet'],
    correctIndex: 0,
    weight: 2,
  },
  {
    id: 'd5',
    type: 'listen_choose',
    prompt: 'Listen — which surah did you hear the start of?',
    audio_verse_key: '112:1',
    options: [
      { label: 'Surah Al-Ikhlas', correct: true },
      { label: 'Surah Al-Fatihah', correct: false },
      { label: 'Surah Al-Falaq', correct: false },
      { label: 'I\'m not sure', correct: false },
    ],
    weight: 3,
  },
  {
    id: 'd6',
    type: 'choose_meaning',
    prompt: 'Which word means "patience"?',
    options: ['الصَّبْرِ', 'الْحَقِّ', 'الْعَصْرِ', 'النَّاسِ'],
    correctIndex: 0,
    weight: 1,
  },
];

// Map a diagnostic score to a starting section.
export function placementFromScore(scorePct) {
  if (scorePct < 35) {
    return {
      sectionId: 'sec_meanings',
      level: 'beginner',
      message:
        'Welcome! We\'ll start at the beginning together with Quran Meanings Explorer. Every great reciter started here.',
    };
  }
  if (scorePct < 70) {
    return {
      sectionId: 'sec_themes',
      level: 'intermediate',
      message:
        'Nice work! You already know some basics. We\'ll start you in Stories That Teach.',
    };
  }
  return {
    sectionId: 'sec_reflect',
    level: 'advanced',
    message:
      'MashaAllah! You know your Quran basics well. We\'ll start you in Reflect and Memorize.',
  };
}
