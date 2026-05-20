// AyahQuest curriculum — Sections → Units → Lessons.
import {
  QURAN_AI_GRATITUDE_QUEST_14_34,
  QURAN_AI_SECTIONS,
} from './quranAiContentPack.js';
//
//
// Each lesson follows the 7-step flow defined in the product plan:
//   1. listen        – hear the ayah with word-by-word highlighting
//   2. understand    – translation + Gemini-simplified tafsir
//   3. words         – 2-3 key Arabic words (Word Explorer)
//   4. tajweed       – one tajweed rule highlighted in context
//   5. practise      – interactive activity (question array)
//   6. moral_scenario – choice-based scenario connected to lesson theme
//   7. reflect       – guided reflection saved to journal
//
// The lesson id doubles as the quest id for backward compatibility with
// the existing quest router.

export const SECTIONS = [
  // =========================================================================
  // SECTION 1 — GRATITUDE (SHUKR)
  // =========================================================================
  {
    id: 'sec_gratitude',
    order: 1,
    title: 'Gratitude — Shukr',
    subtitle: 'Learning to notice Allah\'s blessings and use them well.',
    // Themed "world" — the client renders this section with the Gratitude
    // Garden palette + hero, distinct from other sections.
    theme: 'gratitude',
    world: 'gratitude-garden',
    color: '#F9C74F',
    badgeId: 'grateful_heart',
    // Quran Compass Mission metadata — used by the SectionCompass component
    // to render the 8-petal wheel at the top of the section. Lens N unlocks
    // when the user completes quest N of the compass unit.
    compass: {
      missionTitle: 'Use the Blessing Well',
      lenses: [
        { id: 'blessing', name: 'Blessing Lens', emoji: '🎁' },
        { id: 'word',     name: 'Word Lens',     emoji: '🌱' },
        { id: 'ayah',     name: 'Ayah Lens',     emoji: '📖' },
        { id: 'name',     name: "Allah's Name",  emoji: '✨' },
        { id: 'surah',    name: 'Surah Lens',    emoji: '🕌' },
        { id: 'story',    name: 'Story Lens',    emoji: '📜' },
        { id: 'heart',    name: 'Heart Lens',    emoji: '❤️' },
        { id: 'action',   name: 'Action Lens',   emoji: '🧭' },
      ],
      finalCard: {
        title: 'My Quran Compass — Gratitude',
        lines: [
          'When Allah gives me a blessing:',
          '1. I remember it is from Allah.',
          '2. I say Alhamdulillah.',
          '3. I use it in a good way.',
          '4. I do good for Allah, not to show off.',
        ],
        ayah: 'وَإِن تَعُدُّوا۟ نِعْمَتَ ٱللَّهِ لَا تُحْصُوهَآ',
        ayahRef: '14:34',
        ayahEn: 'If you tried to count Allah\'s blessings, you could not number them.',
      },
    },
    units: [
      {
        id: 'unit_gratitude_core',
        order: 1,
        title: 'The Promise of Gratitude',
        focus: 'Surah Ibrahim 14:7 — Quran\'s most direct promise about gratitude',
        quests: [
          {
            id: 'q_ibrahim_14_7',
            order: 1,
            title: 'If You Are Grateful…',
            xp: 15,
            theme: 'gratitude',
            // Step 1: Listen
            verses: ['14:7'],
            // Step 3: Word Explorer words
            words: [
              {
                arabic: 'لَئِن شَكَرْتُمْ',
                transliteration: 'La-in shakartum',
                root: 'ش ك ر',
                meaning: 'If you are grateful / gave thanks',
                in_ayah: '"If you were grateful…"',
              },
              {
                arabic: 'لَأَزِيدَنَّكُمْ',
                transliteration: 'La-azidannakum',
                root: 'ز ي د',
                meaning: 'I will surely increase you',
                in_ayah: '"…I will increase you in favour"',
              },
              {
                arabic: 'لَكَفَرْتُمْ',
                transliteration: 'la-kafartum',
                root: 'ك ف ر',
                meaning: 'you deny / are ungrateful',
                in_ayah: '"…but if you deny"',
              },
            ],
            // Step 4: Tajweed
            tajweed: {
              rule: 'Lam Shamsiyyah (ال الشمسية)',
              explanation:
                'When the word الشَّاكِرِين (the grateful ones) is said, the "lam" in "al-" is absorbed into the "sh" sound that follows — so we say "ash-shakireen", not "al-shakireen". This rule applies whenever "al-" comes before sun letters (ش ص ز س ث…).',
              highlighted_word: 'الشَّاكِرِين',
              audio_example_verse: '14:7',
            },
            // Step 5: Practise questions
            questions: [
              {
                type: 'meaning_match',
                prompt: 'Match each Arabic word to its meaning',
                pairs: [
                  { arabic: 'شَكَرْتُمْ', meaning: 'You were grateful' },
                  { arabic: 'لَأَزِيدَنَّكُمْ', meaning: 'I will surely increase you' },
                  { arabic: 'لَكَفَرْتُمْ', meaning: 'You were ungrateful' },
                ],
              },
              {
                type: 'listen_choose',
                prompt: 'Listen — which ayah is this?',
                audio_verse_key: '14:7',
                options: [
                  { label: 'Ibrahim 14:7 — The promise of gratitude', correct: true },
                  { label: 'Al-Ikhlas 112:1 — Allah is One', correct: false },
                  { label: 'Al-Asr 103:3 — Patience and truth', correct: false },
                ],
              },
              {
                type: 'choose_meaning',
                prompt: 'In this ayah, what does Allah promise if we are grateful?',
                options: [
                  'He will increase us in blessings',
                  'He will forgive all our sins immediately',
                  'He will give us Jannah without any deeds',
                  'He will protect us from all tests',
                ],
                correctIndex: 0,
                hint: 'لَأَزِيدَنَّكُمْ means "I will surely increase you".',
              },
            ],
            // Step 6: Moral scenario
            moral_scenario: {
              setup:
                'Yusuf gets a new phone. His friend Omar gets the same phone one week later. Yusuf starts to feel annoyed — he wanted to be the only one with it. He stops saying Alhamdulillah for his phone.',
              question: 'What should Yusuf do?',
              options: [
                {
                  text: 'Keep feeling annoyed — it is natural.',
                  correct: false,
                  feedback:
                    'Feeling annoyed is understandable, but staying in that feeling means we lose sight of the blessing we already have.',
                },
                {
                  text: 'Remember that his phone is still a gift from Allah, and gratitude does not depend on what others have.',
                  correct: true,
                  feedback:
                    'Exactly. This ayah reminds us that gratitude is not about having more than others. Yusuf\'s phone is still a blessing — Alhamdulillah for it.',
                },
                {
                  text: 'Ask his parents for a newer phone so he feels better.',
                  correct: false,
                  feedback:
                    'Getting something newer would not fix the feeling. True gratitude comes from inside, not from having more.',
                },
              ],
              quran_connection:
                '"If you are grateful, I will surely increase you." — Ibrahim 14:7',
            },
            // Step 7: Reflect
            reflection: {
              prompt:
                'Think of one thing you have right now that you sometimes forget to be grateful for. What is it?',
              options: [
                'My health',
                'My family',
                'My home',
                'My education',
                'Something else…',
              ],
              allow_custom: true,
            },
            // Asbab an-Nuzul card (optional expandable, pre-loaded, verified)
            asbab_al_nuzul: {
              text:
                'This ayah was revealed as part of a speech of Prophet Ibrahim (peace be upon him) reminding his people to be grateful for Allah\'s blessings, particularly after their liberation from hardship. Ibn Kathir mentions it in the context of Ibrahim\'s da\'wah to his people, urging them to acknowledge Allah\'s constant favour.',
              source: 'Ibn Kathir, Tafsir al-Qur\'an al-Azim',
              note: 'The content above is from a verified classical source. Always refer to a qualified scholar for detailed tafsir discussions.',
            },
          },
          {
            id: 'q_gratitude_luqman',
            order: 2,
            title: 'Wisdom and Gratitude — Luqman 31:12',
            xp: 15,
            theme: 'gratitude',
            verses: ['31:12'],
            words: [
              {
                arabic: 'الْحِكْمَةَ',
                transliteration: 'al-hikmah',
                root: 'ح ك م',
                meaning: 'Wisdom',
                in_ayah: '"We gave Luqman wisdom"',
              },
              {
                arabic: 'اشْكُرْ',
                transliteration: 'ushkur',
                root: 'ش ك ر',
                meaning: 'Be grateful / give thanks (command)',
                in_ayah: '"Be grateful to Allah"',
              },
              {
                arabic: 'غَنِيٌّ حَمِيدٌ',
                transliteration: 'Ghaniyyun Hameed',
                root: 'غ ن ي / ح م د',
                meaning: 'Free of all needs / Praiseworthy',
                in_ayah: '"Allah is Free of all needs, Praiseworthy"',
              },
            ],
            tajweed: {
              rule: 'Ghunnah (غنة) — nasal sound',
              explanation:
                'In the word مَّن (whoever), the doubled meem carries Ghunnah — a nasal "hum" held for two counts. You can feel it vibrate in your nose when you say it correctly. Ghunnah appears on doubled noon (نّ) and doubled meem (مّ).',
              highlighted_word: 'مَّن',
              audio_example_verse: '31:12',
            },
            questions: [
              {
                type: 'choose_meaning',
                prompt: 'Who was given wisdom (الْحِكْمَة) in Luqman 31:12?',
                options: ['Prophet Musa', 'Luqman', 'Prophet Ibrahim', 'Prophet Dawud'],
                correctIndex: 1,
                hint: 'The surah is named after the person who was given this wisdom.',
              },
              {
                type: 'tap_ayah_lesson',
                prompt: 'Which ayah says gratitude benefits yourself, not Allah?',
                options: [
                  { verse_key: '31:12', correct: true },
                  { verse_key: '14:7', correct: false },
                  { verse_key: '103:3', correct: false },
                ],
              },
            ],
            moral_scenario: {
              setup:
                'Fatima gets a good grade on her exam. Her friend says "You\'re so lucky!" Fatima starts thinking — was it luck, or is there something more to say?',
              question: 'What is the wisest response for Fatima?',
              options: [
                {
                  text: 'Agree — it was just luck.',
                  correct: false,
                  feedback:
                    'Calling a blessing "just luck" can make us forget Who gave it to us.',
                },
                {
                  text: 'Say Alhamdulillah — and recognise that her ability, opportunity, and health to study were all from Allah.',
                  correct: true,
                  feedback:
                    'That is wisdom — seeing that everything good comes through Allah, even when we worked for it.',
                },
                {
                  text: 'Say nothing — gratitude is private.',
                  correct: false,
                  feedback:
                    'Gratitude can be expressed aloud — it reminds both you and others of Allah\'s blessings.',
                },
              ],
              quran_connection:
                '"Whoever is grateful is grateful for their own benefit." — Luqman 31:12',
            },
            reflection: {
              prompt:
                'Luqman was known for his wisdom. What is one piece of advice you would give a younger child about gratitude?',
              options: [
                'Say Alhamdulillah even for small things',
                'Look at what you have, not what others have',
                'Remember blessings when you feel sad',
                'Write your own…',
              ],
              allow_custom: true,
            },
            asbab_al_nuzul: null,
          },
          // Source-grounded gratitude quest — added by the quran.ai pipeline.
          QURAN_AI_GRATITUDE_QUEST_14_34,
        ],
      },
      // -------------------------------------------------------------------
      // Unit 2 — The Quran Compass Mission (Gratitude Garden)
      //
      // Eight connected quests forming a single arc. The child meets a
      // real-life scenario in quest 1 (a swimming-skill show-off), then
      // unlocks one Compass lens per quest, then returns to the SAME
      // scenario in quest 8 and chooses the Quran-informed answer. The
      // lenses are: Blessing, Word, Ayah, Allah's Name, Surah, Story,
      // Heart, Action — matching `compass.lenses` on this section.
      //
      // Constraints honoured (per project spec):
      //   - الأحد / الصمد and Surah Al-Ikhlas are NOT included in this unit.
      //   - الشكور IS included.
      //   - Shukr = heart + tongue + action (Saba 34:13 anchors the action
      //     piece). Al-Kawthar 108:1–2 anchors the Juz Amma piece.
      //   - The Family-of-Dawud story uses symbolic visuals only — no
      //     depiction of Prophet Dawud عليه السلام.
      // -------------------------------------------------------------------
      {
        id: 'unit_gratitude_compass',
        order: 2,
        title: 'Quran Compass — Gratitude Garden',
        focus: 'A connected 8-quest mission. Open the compass; use the blessing well.',
        quests: [
          // ---------- Quest 1 — Opening Compass (Blessing Lens) ----------
          {
            id: 'q_grat_compass_01_opening',
            order: 1,
            title: 'The Swimming Blessing',
            xp: 12,
            theme: 'gratitude',
            // Compass metadata: which lens this quest unlocks.
            compass_lens: 'blessing',
            verses: [],
            questions: [
              {
                type: 'moral_scenario',
                setup:
                  'Abdullah just learned how to swim. He feels excited. At the pool he wants to shout, "Look at me — I\'m better than everyone!" He even thinks about swimming in the deep, unsafe side to impress people.',
                question: 'What should Abdullah remember FIRST?',
                options: [
                  {
                    text: 'This skill is a blessing from Allah.',
                    correct: true,
                    feedback:
                      'Beautiful. Learning to swim is a blessing — a niʿmah from Allah. That changes everything that comes next.',
                  },
                  {
                    text: 'I am better than everyone.',
                    correct: false,
                    feedback:
                      'A blessing should make us remember Allah, not feel above other people.',
                  },
                  {
                    text: 'I should swim in dangerous places so people clap.',
                    correct: false,
                    feedback:
                      'Allah gave us this skill so we use it safely and well — not to chase claps.',
                  },
                  {
                    text: 'I do not need to thank anyone.',
                    correct: false,
                    feedback:
                      'Every good thing we can do came from Allah first. Gratitude starts there.',
                  },
                ],
              },
            ],
          },
          // ---------- Quest 2 — Word Garden (Word Lens) ----------
          {
            id: 'q_grat_compass_02_words',
            order: 2,
            title: 'Word Garden: Blessing Words',
            xp: 15,
            theme: 'gratitude',
            compass_lens: 'word',
            verses: [],
            words: [
              {
                arabic: 'ٱلشُّكْر',
                transliteration: 'ash-shukr',
                root: 'ش ك ر',
                meaning: 'Gratitude — knowing the blessing is from Allah and using it well.',
                in_ayah: '"…work in gratitude" (34:13)',
              },
              {
                arabic: 'ٱلنِّعْمَة',
                transliteration: 'an-niʿmah',
                root: 'ن ع م',
                meaning: 'A blessing — anything good Allah gives us.',
                in_ayah: '"If you tried to count Allah\'s blessings…" (14:34)',
              },
              {
                arabic: 'ٱلْحَمْد',
                transliteration: 'al-ḥamd',
                root: 'ح م د',
                meaning: 'Praise and thanks — saying Alhamdulillah.',
                in_ayah: '"All praise is for Allah, Lord of the worlds" (1:2)',
              },
              {
                arabic: 'ٱلرِّزْق',
                transliteration: 'ar-rizq',
                root: 'ر ز ق',
                meaning: 'Provision from Allah — food, knowledge, family, ability…',
              },
              {
                arabic: 'كَفُور',
                transliteration: 'kafūr',
                root: 'ك ف ر',
                meaning: 'Ungrateful — forgetting the blessing came from Allah, or misusing it.',
                in_ayah: '"…grateful or ungrateful" (76:3)',
              },
            ],
            questions: [
              {
                type: 'meaning_match',
                prompt: 'Match each word to its meaning',
                pairs: [
                  { arabic: 'ٱلنِّعْمَة', meaning: 'A blessing from Allah' },
                  { arabic: 'ٱلشُّكْر', meaning: 'Gratitude — using the blessing well' },
                  { arabic: 'كَفُور', meaning: 'Forgetting / misusing the blessing' },
                  { arabic: 'ٱلْحَمْد', meaning: 'Praise — saying Alhamdulillah' },
                ],
              },
              {
                type: 'choose_meaning',
                prompt: 'What does ٱلشُّكْر mean?',
                arabic: 'ٱلشُّكْر',
                options: [
                  'Knowing the blessing is from Allah and using it well',
                  'Complaining about what Allah gave us',
                  'Hiding all blessings so no one can see them',
                  'Making people praise us',
                ],
                correctIndex: 0,
              },
              {
                type: 'choose_meaning',
                prompt: 'What does كَفُور mean here?',
                arabic: 'كَفُور',
                options: [
                  'Being thankful',
                  'Sharing kindly with everyone',
                  'Forgetting or misusing Allah\'s blessing',
                  'Saying Alhamdulillah',
                ],
                correctIndex: 2,
              },
            ],
          },
          // ---------- Quest 3 — Gratitude is Action (Ayah Lens) ----------
          {
            id: 'q_grat_compass_03_action_ayah',
            order: 3,
            title: 'Gratitude Is Action — Saba 34:13',
            xp: 15,
            theme: 'gratitude',
            compass_lens: 'ayah',
            verses: ['34:13'],
            words: [
              {
                arabic: 'ٱعْمَلُوٓا۟',
                transliteration: 'iʿmalū',
                root: 'ع م ل',
                meaning: 'Work / do (an action)',
                in_ayah: '"Work, O family of Dawud…"',
              },
              {
                arabic: 'شُكْرًا',
                transliteration: 'shukran',
                root: 'ش ك ر',
                meaning: 'In gratitude',
                in_ayah: '"…work in gratitude"',
              },
            ],
            questions: [
              {
                type: 'choose_meaning',
                prompt:
                  'Allah told the family of Dawud: "Work in gratitude." Does that mean we only need to SAY Alhamdulillah?',
                options: [
                  'No — we say Alhamdulillah AND use the blessing well.',
                  'Yes — we only say it and then we can do anything.',
                  'No — we never need to say Alhamdulillah.',
                  'It means showing everyone how good we are.',
                ],
                correctIndex: 0,
              },
            ],
          },
          // ---------- Quest 4 — Ash-Shakoor (Allah's Name Lens) ----------
          {
            id: 'q_grat_compass_04_ash_shakoor',
            order: 4,
            title: "Allah's Name: Ash-Shakūr",
            xp: 15,
            theme: 'gratitude',
            compass_lens: 'name',
            verses: [],
            // Inline "Allah's Name" panel — rendered specially by the
            // QuestPage when a quest has this field.
            allah_name: {
              arabic: 'ٱلشَّكُور',
              transliteration: 'Ash-Shakūr',
              meaning: 'The Most Appreciative — Allah notices and rewards sincere good deeds, even small ones.',
              child_explanation:
                'Allah sees every good thing you do for Him, even when nobody else sees it. Your small good deeds matter to Allah.',
            },
            questions: [
              {
                type: 'moral_scenario',
                setup:
                  'Mariam quietly helps her sister clean up the toys after a long day. Nobody else is in the room. Nobody saw her do it.',
                question: 'Who notices Mariam\'s kindness?',
                options: [
                  {
                    text: 'Allah notices — He is Ash-Shakūr.',
                    correct: true,
                    feedback:
                      'Yes. Allah is الشَّكُور — He sees and appreciates every sincere good deed, even quiet ones.',
                  },
                  {
                    text: 'Nobody knows, so it does not matter.',
                    correct: false,
                    feedback:
                      'Allah always knows. Sincere good is never wasted.',
                  },
                  {
                    text: 'Only the toys know.',
                    correct: false,
                    feedback:
                      'A sweet thought! But really — Allah is the One who sees what people do not.',
                  },
                  {
                    text: 'It only matters if people clap.',
                    correct: false,
                    feedback:
                      'Then we would always need an audience. Allah teaches us to do good for Him, not for the clapping.',
                  },
                ],
              },
            ],
          },
          // ---------- Quest 5 — Surah Al-Kawthar (Surah Lens) ----------
          {
            id: 'q_grat_compass_05_kawthar',
            order: 5,
            title: 'Surah World: Al-Kawthar',
            xp: 18,
            theme: 'gratitude',
            compass_lens: 'surah',
            verses: ['108:1', '108:2'],
            questions: [
              {
                type: 'listen_choose',
                prompt: 'Listen to ayah 108:1, then choose the meaning.',
                audio: { verse_key: '108:1' },
                options: [
                  { label: 'Indeed, We have granted you al-Kawthar (great abundance).', correct: true },
                  { label: 'Stand up at night and pray.', correct: false },
                  { label: 'Spend from what We have given you.', correct: false },
                ],
              },
              {
                type: 'choose_meaning',
                prompt:
                  'Allah gives great good (al-Kawthar). What does Surah Al-Kawthar tell us to do in response?',
                options: [
                  'Show it off so people respect us',
                  'Pray and thank Allah for it',
                  'Hide it and forget Allah',
                  'Waste the blessings',
                ],
                correctIndex: 1,
              },
            ],
          },
          // ---------- Quest 6 — Story Detective (Story Lens) ----------
          {
            id: 'q_grat_compass_06_story',
            order: 6,
            title: 'Story Detective: Work in Gratitude',
            xp: 18,
            theme: 'gratitude',
            compass_lens: 'story',
            // Link to the symbolic story added to stories.js. The Storybook
            // Library page can show it; clicking from here also opens it.
            story_id: 'story_work_in_gratitude',
            verses: ['34:13'],
            questions: [
              {
                type: 'choose_meaning',
                prompt: 'What does "work in gratitude" mean?',
                options: [
                  'Use Allah\'s blessings in a way that pleases Him',
                  'Only say "thank you" but use blessings badly',
                  'Show people that you are better than them',
                  'Stop using the blessing so it doesn\'t get used up',
                ],
                correctIndex: 0,
              },
            ],
          },
          // ---------- Quest 7 — Heart Lab (Heart Lens) ----------
          {
            id: 'q_grat_compass_07_heart_lab',
            order: 7,
            title: 'Heart Lab: Thankful or Forgetful?',
            xp: 18,
            theme: 'gratitude',
            compass_lens: 'heart',
            verses: ['76:3'],
            questions: [
              {
                // New question type — see client/src/components/questions/HeartLabSort.jsx
                type: 'heart_lab_sort',
                prompt:
                  'Sort each action into the right heart. Thankful actions remember Allah and use the blessing well.',
                buckets: [
                  { id: 'thankful', label: 'Thankful Heart', emoji: '❤️' },
                  { id: 'forgetful', label: 'Forgetful / Show-off Heart', emoji: '🌫' },
                ],
                items: [
                  { text: 'Says Alhamdulillah after a gift.', bucket: 'thankful' },
                  { text: 'Uses swimming skill safely.', bucket: 'thankful' },
                  { text: 'Helps a beginner feel brave.', bucket: 'thankful' },
                  { text: 'Shares extra food kindly.', bucket: 'thankful' },
                  { text: 'Helps when nobody is watching.', bucket: 'thankful' },
                  { text: 'Complains about every meal.', bucket: 'forgetful' },
                  { text: 'Wastes food.', bucket: 'forgetful' },
                  { text: '"I got this because I am amazing."', bucket: 'forgetful' },
                  { text: 'Swims dangerously to impress people.', bucket: 'forgetful' },
                  { text: 'Helps only when people are watching.', bucket: 'forgetful' },
                ],
              },
            ],
          },
          // ---------- Quest 8 — Final Compass (Action Lens) ----------
          {
            id: 'q_grat_compass_08_final',
            order: 8,
            title: 'Quran Compass Mission: Use the Blessing Well',
            xp: 25,
            theme: 'gratitude',
            compass_lens: 'action',
            verses: [],
            // Same scenario as quest 1 — but now the Quran Compass is open.
            // The "correct" answer is the multi-step Quran Compass choice.
            questions: [
              {
                type: 'moral_scenario',
                setup:
                  'Back to Abdullah. He learned to swim, and he is great at it. He wants to show off and swim in a dangerous part of the pool. Then he notices another child who is scared because they cannot swim well.',
                question: 'The Compass is open. What is the Quran Compass choice?',
                options: [
                  {
                    text:
                      'Say Alhamdulillah, swim safely, avoid showing off, and use the skill to encourage and help the other child.',
                    correct: true,
                    feedback:
                      'Beautiful choice. Abdullah remembered the blessing came from Allah, thanked Him, and used the blessing in a way Allah loves.',
                  },
                  {
                    text: 'Swim dangerously so everyone claps.',
                    correct: false,
                    feedback:
                      'A blessing should bring us closer to Allah, not put us in danger to impress people.',
                  },
                  {
                    text: 'Laugh at the child who cannot swim.',
                    correct: false,
                    feedback:
                      'A thankful heart is gentle with others, never mocking.',
                  },
                  {
                    text: '"I am better than everyone."',
                    correct: false,
                    feedback:
                      'The ability came from Allah. The right response is shukr — not pride.',
                  },
                ],
              },
            ],
            // The reflection step at the end saves the Grateful-Heart card
            // to Toolkit and awards the badge.
            reflection: {
              prompt: 'What is one blessing Allah gave you today, and how will you use it well?',
              options: [
                'My family / friends',
                'My health and body',
                'A skill I am learning',
                'The Quran in my life',
              ],
              allow_custom: true,
            },
          },
        ],
      },
    ],
  },
  // =========================================================================
  // SECTION 2 — QURAN MEANINGS EXPLORER
  // =========================================================================
  {
    id: 'sec_meanings',
    order: 2,
    title: 'Quran Meanings Explorer',
    subtitle: 'Words you hear every day',
    color: '#1CB0F6',
    units: [
      {
        id: 'unit_words_daily',
        order: 1,
        title: 'Words I Hear Every Day',
        focus: 'Al-Fatihah and Al-Ikhlas',
        quests: [
          {
            id: 'q_fatihah_words_1',
            order: 1,
            title: "Allah's Names: Rahman & Rahim",
            xp: 10,
            theme: 'names_of_allah',
            verses: ['1:1', '1:3'],
            words: [
              { arabic: 'الرَّحْمَٰن', transliteration: 'ar-Rahman', root: 'ر ح م', meaning: 'The Most Kind to everyone', in_ayah: 'Bismillah ar-Rahman…' },
              { arabic: 'الرَّحِيم', transliteration: 'ar-Rahim', root: 'ر ح م', meaning: 'The Especially Kind to believers', in_ayah: '…ar-Rahman ar-Rahim' },
            ],
            tajweed: {
              rule: 'Madd Tabee\'i (Natural Lengthening)',
              explanation:
                'In الرَّحْمَٰن the alif after the ra\' is stretched for 2 counts — this is called Madd Tabee\'i (natural lengthening). Whenever an alif follows a fatha, a ya follows a kasra, or a waw follows a damma — hold it 2 counts.',
              highlighted_word: 'الرَّحْمَٰن',
              audio_example_verse: '1:1',
            },
            questions: [
              {
                type: 'choose_meaning',
                prompt: 'What does الرَّحْمَٰن (ar-Rahman) mean?',
                options: ['The Strong One', 'The Most Kind to everyone', 'The Wise One', 'The First'],
                correctIndex: 1,
                hint: 'Think of someone whose kindness covers every single creature.',
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
            ],
            moral_scenario: {
              setup:
                'Adam is feeling sad and a bit lost. His friend Bilal tells him "Just be happy, there\'s no reason to be sad." Adam doesn\'t feel heard.',
              question: 'What would show the quality of ar-Rahim — extra kindness — in this situation?',
              options: [
                { text: 'Agree with Bilal — sometimes people just need to cheer up.', correct: false, feedback: 'Being kind means meeting people where they are, not dismissing their feelings.' },
                { text: 'Sit with Adam, listen without judging, and remind him gently that Allah is ar-Rahman — kind to everyone, including him right now.', correct: true, feedback: 'That is ar-Rahim in action — a special, personal kindness that listens and comforts.' },
                { text: 'Leave Adam alone — he probably wants space.', correct: false, feedback: 'Sometimes people need company. Checking in gently is an act of kindness.' },
              ],
              quran_connection: 'Allah is ar-Rahman — kind to all. And ar-Rahim — especially kind. We can reflect both in how we treat others.',
            },
            reflection: {
              prompt: 'Allah is ar-Rahman to everyone. Name one way you can be kind today, even to someone you don\'t know well.',
              options: ['Smile at someone', 'Share something', 'Say something encouraging', 'Help without being asked', 'Something else…'],
              allow_custom: true,
            },
            asbab_al_nuzul: null,
          },
          {
            id: 'q_ikhlas_oneness',
            order: 2,
            title: 'Allah is One — Surah Al-Ikhlas',
            xp: 12,
            theme: 'tawheed',
            verses: ['112:1', '112:2', '112:3', '112:4'],
            words: [
              { arabic: 'أَحَدٌ', transliteration: 'Ahad', root: 'و ح د', meaning: 'One — uniquely One', in_ayah: 'Allah is One' },
              { arabic: 'الصَّمَدُ', transliteration: 'as-Samad', root: 'ص م د', meaning: 'The One everyone needs; who needs no one', in_ayah: 'Allah, the Eternal Refuge' },
            ],
            tajweed: {
              rule: 'Qalqalah (قلقلة) — echo/bounce',
              explanation:
                'In the word أَحَدٌ the "d" at the end has a slight bounce or echo — this is Qalqalah. It occurs on the letters ق ط ب ج د when they appear with sukun (no vowel) or at the end of a word. Say the letter, then let it "pop" slightly.',
              highlighted_word: 'أَحَدٌ',
              audio_example_verse: '112:1',
            },
            questions: [
              {
                type: 'choose_meaning',
                prompt: 'What does الصَّمَد mean?',
                options: ['Allah is far away', 'Allah needs nothing, but everyone needs Him', 'Allah is silent', 'Allah is angry'],
                correctIndex: 1,
                hint: 'Think: who do plants need? Sun, water. Who does the sun need? Allah made it. Allah needs… nobody.',
              },
              {
                type: 'fill_blank',
                prompt: 'Fill in the missing word',
                ayah_template: 'قُلْ هُوَ اللَّهُ ____',
                blank: 'أَحَدٌ',
                options: ['أَحَدٌ', 'الصَّمَدُ', 'يُولَدْ', 'كُفُوًا'],
              },
            ],
            moral_scenario: {
              setup:
                'Nour is worried about an exam. She keeps thinking: "What if I fail? What if everything goes wrong?" She feels like she\'s carrying the weight of the world.',
              question: 'How does knowing Allah is الصَّمَد (the One everyone needs) help Nour?',
              options: [
                { text: 'It doesn\'t help — worrying is just natural.', correct: false, feedback: 'Worrying is natural, but faith gives us something to anchor to when worry comes.' },
                { text: 'She can turn her worry into du\'a — asking the One who truly holds everything. She did her part by studying; the rest belongs to Allah.', correct: true, feedback: 'الصَّمَد means we can always turn to Allah. Doing your part and trusting the outcome — that is tawakkul built on tawheed.' },
                { text: 'She should just stop thinking about it.', correct: false, feedback: 'Suppressing worries doesn\'t help. Turning them into du\'a and trust does.' },
              ],
              quran_connection: 'Allah is الصَّمَد — the Eternal Refuge. Everyone and everything turns to Him.',
            },
            reflection: {
              prompt: 'Al-Ikhlas is called "a third of the Quran" because of how completely it describes Allah. What is one thing about Allah that makes you feel safe?',
              options: ['That He always knows', 'That He always hears', 'That He is always there', 'That He is merciful', 'Something else…'],
              allow_custom: true,
            },
            asbab_al_nuzul: {
              text: 'This surah was revealed in response to a question from polytheists or People of the Book who asked the Prophet ﷺ to "describe your Lord\'s lineage." Allah answered with this complete description of His oneness and uniqueness.',
              source: 'Ibn Kathir, Tafsir al-Qur\'an al-Azim',
              note: 'The content above is from a verified classical source.',
            },
          },
        ],
      },
    ],
  },
  // =========================================================================
  // SECTION 3 — TIME AND CHARACTER (AL-ASR)
  // =========================================================================
  {
    id: 'sec_time',
    order: 3,
    title: 'Time and Character',
    subtitle: 'Four things that save you',
    color: '#FF9600',
    units: [
      {
        id: 'unit_asr',
        order: 1,
        title: 'The Value of Time — Al-Asr',
        focus: 'Surah Al-Asr — patience, truth, good actions',
        quests: [
          {
            id: 'q_asr_lessons',
            order: 1,
            title: 'Four Things That Save You',
            xp: 12,
            theme: 'time',
            verses: ['103:1', '103:2', '103:3'],
            words: [
              { arabic: 'الْعَصْرِ', transliteration: 'al-Asr', root: 'ع ص ر', meaning: 'Time / The declining afternoon', in_ayah: 'By Time…' },
              { arabic: 'خُسْرٍ', transliteration: 'khusr', root: 'خ س ر', meaning: 'Loss, losing out', in_ayah: 'mankind is in loss' },
              { arabic: 'الصَّبْرِ', transliteration: 'as-Sabr', root: 'ص ب ر', meaning: 'Patience — staying strong', in_ayah: 'advise each other to patience' },
            ],
            tajweed: {
              rule: 'Lam Shamsiyyah in الصَّبْرِ',
              explanation:
                'In الصَّبْرِ (as-Sabr), the "lam" in "al-" disappears into the "s" sound. This is Lam Shamsiyyah — the lam is absorbed by the sun letter (ص) that follows, giving us "as-Sabr" not "al-Sabr".',
              highlighted_word: 'الصَّبْرِ',
              audio_example_verse: '103:3',
            },
            questions: [
              {
                type: 'choose_meaning',
                prompt: 'Surah Al-Asr says most people are in خُسْر. What does that mean?',
                options: ['Joy', 'Loss', 'Sleep', 'Sickness'],
                correctIndex: 1,
                hint: 'Think of how you feel when you wasted an afternoon and got nothing done.',
              },
              {
                type: 'order_events',
                prompt: 'Al-Asr lists four things. Put them in the order they appear in the ayah.',
                items: [
                  { id: 'e1', text: 'Believing (Iman)' },
                  { id: 'e2', text: 'Doing good deeds' },
                  { id: 'e3', text: 'Advising each other to truth' },
                  { id: 'e4', text: 'Advising each other to patience' },
                ],
              },
            ],
            moral_scenario: {
              setup:
                'Hamza wants to memorise Surah Al-Asr but gives up after two days because it feels hard. His sister Yasmin is also learning it and keeps going even when she makes mistakes.',
              question: 'Which character trait from Al-Asr is Yasmin showing?',
              options: [
                { text: 'Ingratitude', correct: false, feedback: 'Ingratitude is not the theme here — look at what Yasmin is doing with difficulty.' },
                { text: 'Patience (Sabr) — staying steady even when it is hard', correct: true, feedback: 'Exactly. الصَّبْرِ — patience — is one of the four things Al-Asr says saves us from loss. Yasmin is living it.' },
                { text: 'Showing off', correct: false, feedback: 'There is no showing off here — Yasmin is simply persisting.' },
              ],
              quran_connection: '"…and advised each other to patience." — Al-Asr 103:3',
            },
            reflection: {
              prompt: 'The surah says we should advise each other to be patient. Who in your life helps you stay patient?',
              options: ['A parent', 'A friend', 'A teacher', 'Myself', 'Someone else…'],
              allow_custom: true,
            },
            asbab_al_nuzul: null,
          },
        ],
      },
    ],
  },
  // =========================================================================
  // SECTION 4 — PROTECTION (AL-FALAQ & AN-NAS)
  // =========================================================================
  {
    id: 'sec_protection',
    order: 4,
    title: 'Allah Protects You',
    subtitle: 'The Mu\'awwidhatain — surahs of refuge',
    color: '#CE82FF',
    units: [
      {
        id: 'unit_protection',
        order: 1,
        title: 'Seek Refuge at Daybreak',
        focus: 'Al-Falaq 113 and An-Nas 114',
        quests: [
          {
            id: 'q_falaq_protection',
            order: 1,
            title: 'When You Feel Scared',
            xp: 12,
            theme: 'protection',
            verses: ['113:1', '113:2', '113:3', '113:4', '113:5'],
            words: [
              { arabic: 'الْفَلَقِ', transliteration: 'al-Falaq', root: 'ف ل ق', meaning: 'Daybreak — when night splits open', in_ayah: 'Lord of daybreak' },
              { arabic: 'حَاسِدٍ', transliteration: 'hasid', root: 'ح س د', meaning: 'A jealous person', in_ayah: 'the evil of an envier when he envies' },
            ],
            tajweed: {
              rule: 'Idgham (إدغام) — merging',
              explanation:
                'In "مِن شَرِّ" the noon (ن) of "min" merges into the sheen (ش) that follows, with a nasal sound — this is Idgham with Ghunnah. When a noon saakin or tanween is followed by certain letters (ي ن م و), the sound blends in.',
              highlighted_word: 'مِن شَرِّ',
              audio_example_verse: '113:2',
            },
            questions: [
              {
                type: 'choose_meaning',
                prompt: 'What does الْفَلَق mean?',
                options: ['A loud sound', 'Daybreak — when night splits open', 'A storm', 'A mountain'],
                correctIndex: 1,
                hint: 'Imagine the moment dawn cracks through the dark sky.',
              },
              {
                type: 'tap_ayah_lesson',
                prompt: 'Which ayah asks Allah for protection from a jealous person?',
                options: [
                  { verse_key: '113:5', correct: true },
                  { verse_key: '113:1', correct: false },
                  { verse_key: '113:3', correct: false },
                ],
              },
            ],
            moral_scenario: {
              setup:
                'Sarah notices that her classmate keeps copying her work and then pretends it is her own. Sarah is starting to feel angry and wants to expose her classmate publicly.',
              question: 'What does Al-Falaq teach us about dealing with people who might harm us?',
              options: [
                { text: 'We should expose them and make them feel embarrassed.', correct: false, feedback: 'Publicly humiliating someone can cause more harm. There are better ways to protect yourself.' },
                { text: 'We can ask Allah for protection (as Al-Falaq teaches) and speak to a trusted adult — without using it as a reason to be unkind.', correct: true, feedback: 'Al-Falaq teaches us to seek Allah\'s protection. Turning to Allah first, then handling the situation wisely and calmly, is the guided path.' },
                { text: 'Ignore it — it doesn\'t matter.', correct: false, feedback: 'Protecting your rights is important — but the way we do it matters too.' },
              ],
              quran_connection: '"Say: I seek refuge in the Lord of daybreak." — Al-Falaq 113:1',
            },
            reflection: {
              prompt: 'When you feel scared or worried at night, what is one thing you could say or do that this surah teaches?',
              options: ['Read Al-Falaq', 'Say Bismillah', 'Ask Allah for safety', 'Remember Allah is stronger than anything scary', 'Something else…'],
              allow_custom: true,
            },
            asbab_al_nuzul: null,
          },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// quran.ai content pack — append source-grounded sections.
// "Who Allah Loves" and "Quran Wonders / Signs Detective".
// ---------------------------------------------------------------------------
for (const s of QURAN_AI_SECTIONS) {
  if (!SECTIONS.some((existing) => existing.id === s.id)) SECTIONS.push(s);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
  return allQuests[day % allQuests.length];
}
