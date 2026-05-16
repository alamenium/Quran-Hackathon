// Quran Compass Missions — the wow-factor pedagogy.
//
// Structure:
//   Each mission opens with a real-life problem the child has to react to.
//   They make a first-pass choice based on instinct (right or wrong, no
//   judgement). Then the Quran Compass unlocks piece by piece — six "lenses"
//   that each teach one way of seeing the situation through Quran:
//
//       1. Blessing Lens   — re-frame the situation as a ni'mah from Allah
//       2. Word Lens       — Arabic vocabulary pegs (نعمة، شكر، الحمد، رزق)
//       3. Name Lens       — a relevant Name of Allah
//       4. Surah Lens      — a short surah on the theme
//       5. Ikhlas Lens     — sincerity check (Surah Al-Ikhlas)
//       6. Heart Lens      — the trait being trained
//
//   After the six lenses the SAME problem returns, and the child chooses
//   the Quran-informed answer. They earn a "My Quran Compass" card that
//   lives in their Toolkit.
//
// Lens content shape:
//   { id, title, emoji, intro, content, check }
//   where `check` is { kind: 'mc', prompt, options: [{label, correct}] }
//
// Problem shape (opening / closing):
//   { scene, prompt, options: [{label, correct?, feedback}] }

export const COMPASS_MISSIONS = [
  {
    id: 'gratitude',
    title: 'The Gratitude Compass',
    subtitle: 'Shukr — seeing every blessing as from Allah',
    description:
      'Abdullah just got the highest grade in his class. What should he do? Help him pick the answer his Quran Compass would give.',
    emoji: '🌟',
    color: 'gold',
    trait: 'Shukr',
    arabicTrait: 'شكر',
    opening: {
      scene:
        'Abdullah got the highest grade in class. He wants to say: "I\'m smarter than everyone!"',
      prompt: 'What should Abdullah do?',
      options: [
        {
          label: 'Tell everyone he is the smartest.',
          correct: false,
          feedback:
            'That feels good for a moment, but it can hurt others and forget who really gave him the grade.',
        },
        {
          label: 'Say nothing and feel proud quietly.',
          correct: false,
          feedback:
            'Better than showing off — but he\'s still missing the most important step.',
        },
        {
          label: 'Say Alhamdulillah and remember Allah helped him.',
          correct: true,
          feedback:
            'You already feel it! Let\'s use the Quran Compass to see why this is the strongest answer.',
        },
      ],
    },
    lenses: [
      {
        id: 'blessing',
        title: 'Blessing Lens',
        emoji: '🎁',
        intro: 'First — who really gave Abdullah the grade?',
        content:
          'A high grade looks like Abdullah\'s effort, and his effort matters. But the brain that learned, the time he had to study, even the question being one he understood — these are all gifts (nuʿam) from Allah. A grade is a blessing first, and an achievement second.',
        check: {
          kind: 'mc',
          prompt: 'Where did the ability to get a high grade come from?',
          options: [
            { label: 'Only from Abdullah\'s hard work.', correct: false },
            { label: 'From Allah, who gave him the ability and the chance.', correct: true },
            { label: 'From his teacher.', correct: false },
          ],
        },
      },
      {
        id: 'words',
        title: 'Word Lens',
        emoji: '🔤',
        intro: 'Four words that unlock the gratitude conversation in Arabic.',
        content: 'Tap each card to learn it.',
        words: [
          { ar: 'نِعْمَة', en: 'A blessing — a gift from Allah.' },
          { ar: 'شُكْر', en: 'Thanks — recognising and using the gift well.' },
          { ar: 'ٱلْحَمْد', en: 'All praise — saying Alhamdulillah.' },
          { ar: 'رِزْق', en: 'Provision — anything Allah supplies you with.' },
        ],
        check: {
          kind: 'mc',
          prompt: 'Which word means "a blessing — a gift from Allah"?',
          options: [
            { label: 'شُكْر', correct: false },
            { label: 'نِعْمَة', correct: true },
            { label: 'رِزْق', correct: false },
            { label: 'ٱلْحَمْد', correct: false },
          ],
        },
      },
      {
        id: 'name',
        title: "Allah's Name Lens",
        emoji: '✨',
        intro: 'One of the Names of Allah — and how it changes how Abdullah feels about his grade.',
        content:
          'الشَّكُور (Ash-Shakūr): Allah notices and rewards even the smallest sincere good deed — the quiet thank-you, the prayer no-one saw, the help nobody knew about. So Abdullah doesn\'t need everyone to clap for him: Allah sees, and Allah is الشَّكُور.',
        nameAr: 'الشَّكُور',
        nameEn: 'Ash-Shakūr — The Most Appreciative',
        check: {
          kind: 'mc',
          prompt: 'Why doesn\'t Abdullah need everyone to praise him?',
          options: [
            { label: 'Because praise from people is forbidden.', correct: false },
            { label: 'Because Allah (الشَّكُور) already notices and rewards every sincere good thing.', correct: true },
            { label: 'Because he should be sad.', correct: false },
          ],
        },
      },
      {
        id: 'surah',
        title: 'Surah Lens',
        emoji: '📖',
        intro: 'A short surah that flips the whole meaning of "I got something good".',
        content:
          'Surah Al-Kawthar (108) — Allah tells His Prophet ﷺ: "We have given you abundance." The reply isn\'t "look at me!" — the reply is: "so pray and offer thanks." The pattern is: Allah gives → so we worship and thank.',
        verseKey: '108:1',
        check: {
          kind: 'mc',
          prompt: 'When Allah gives us something good, what does Surah Al-Kawthar tell us to do?',
          options: [
            { label: 'Show it off so people respect us.', correct: false },
            { label: 'Pray and thank Allah for it.', correct: true },
            { label: 'Hide it forever.', correct: false },
          ],
        },
      },
      {
        id: 'ikhlas',
        title: 'Ikhlas Lens',
        emoji: '🤍',
        intro: 'A sincerity check — the question only your heart can answer.',
        content:
          'Surah Al-Ikhlas (112) reminds us Allah is الأَحَد (the One) and الصَّمَد (the One we all turn to). Only Allah deserves our showing-off-energy. So when Abdullah does something well, the question becomes: "Am I doing this for Allah, or for the clapping?" That little question is ikhlas — sincerity.',
        verseKey: '112:1',
        check: {
          kind: 'mc',
          prompt: 'A sincere good deed is one done…',
          options: [
            { label: '…so people will notice and praise me.', correct: false },
            { label: '…for Allah, even if no one notices.', correct: true },
            { label: '…only when it\'s easy.', correct: false },
          ],
        },
      },
      {
        id: 'heart',
        title: 'Heart Lens',
        emoji: '❤️',
        intro: 'The trait we\'re training — and the opposite habit to spot.',
        content:
          'Shukr (gratitude) is a habit of the heart. Its opposite isn\'t silence — it\'s forgetting where the blessing came from, or showing it off as if you made it yourself. Sort these reactions: which are shukr, and which are showing off?',
        sortItems: [
          { text: 'Quietly say Alhamdulillah after seeing the grade.', shukr: true },
          { text: 'Tell everyone in class your score, twice.', shukr: false },
          { text: 'Help a friend who didn\'t do as well, without making them feel small.', shukr: true },
          { text: 'Post your grade everywhere so people praise you.', shukr: false },
          { text: 'Thank the teacher who explained the topic to you.', shukr: true },
        ],
        check: {
          kind: 'mc',
          prompt: 'Which reaction is shukr?',
          options: [
            { label: 'Saying "I\'m smarter than everyone!"', correct: false },
            { label: 'Quietly saying Alhamdulillah and helping a friend.', correct: true },
            { label: 'Posting the grade to be praised.', correct: false },
          ],
        },
      },
    ],
    closing: {
      scene:
        'Back to Abdullah. He just got that highest grade. The compass is open. What is the Quran Compass choice?',
      prompt: 'Which answer does the Quran Compass point to?',
      options: [
        {
          label: 'Brag in class so everyone knows.',
          correct: false,
          feedback:
            'The compass points the other way — that forgets the blessing came from Allah and chases praise from people.',
        },
        {
          label:
            'Say Alhamdulillah, remember the ability came from Allah, avoid showing off, and use the blessing to help others.',
          correct: true,
          feedback: 'Mashā\' Allah — that\'s the Quran Compass answer.',
        },
        {
          label: 'Hide the grade and feel guilty about it.',
          correct: false,
          feedback:
            'The compass doesn\'t point to guilt either — a blessing from Allah is something to be grateful for, not ashamed of.',
        },
      ],
    },
    card: {
      title: 'My Quran Compass — Gratitude',
      lines: [
        'When Allah gives me a blessing:',
        '1. I remember it is from Allah.',
        '2. I say Alhamdulillah.',
        '3. I use it in a good way.',
        '4. I do good for Allah, not for showing off.',
      ],
      ayah: 'وَإِن تَعُدُّوا نِعْمَتَ ٱللَّهِ لَا تُحْصُوهَا',
      ayahRef: '14:34',
      ayahEn: 'If you tried to count Allah\'s blessings, you could not number them.',
    },
  },
];

export function listMissions() {
  return COMPASS_MISSIONS.map((m) => ({
    id: m.id,
    title: m.title,
    subtitle: m.subtitle,
    description: m.description,
    emoji: m.emoji,
    color: m.color,
    lensCount: m.lenses.length,
  }));
}

export function findMission(id) {
  return COMPASS_MISSIONS.find((m) => m.id === id) || null;
}
