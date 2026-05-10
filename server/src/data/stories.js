// Quran-based storybook content for the Storybook Library feature.
// Each story is composed of pages with Arabic ayah anchors, child-friendly
// prose, and an end-of-story activity.

export const STORIES = [
  {
    id: 'story_owners_garden',
    title: 'The Owners of the Garden',
    surah_reference: '68:17–33',
    summary:
      'A story of three brothers who forgot to thank Allah for their beautiful garden — and what happened next.',
    cover_emotion: 'think',
    pages: [
      {
        page: 1,
        text:
          'Long ago, a kind man owned a beautiful garden full of date trees and ripe fruit. Every harvest he would call the poor people of his town and share the best of his fruit with them. He never forgot to say "InshaAllah" — if Allah wills.',
        emotion: 'smile',
      },
      {
        page: 2,
        text:
          'When the kind man passed away, his three sons took over the garden. They were proud of their new wealth. They said to each other, "We will pick the fruit very early — before any poor person sees us. We will keep it ALL for ourselves."',
        emotion: 'think',
      },
      {
        page: 3,
        text:
          'They forgot something important. They forgot to say "InshaAllah." They forgot that Allah is the One who actually gives the fruit.',
        emotion: 'surprise',
      },
      {
        page: 4,
        text:
          'That night, while the brothers slept, a wind from Allah passed over the garden. By morning the fruit was gone. The whole garden looked like a black, burnt field.',
        emotion: 'scared',
      },
      {
        page: 5,
        text:
          'When the brothers reached the garden at dawn, they could not believe their eyes. "We must be in the wrong place!" one shouted. The wisest brother said, "Did I not tell you to remember Allah?" They sat together and cried, "Our Lord, we were wrong. We were greedy. Forgive us."',
        emotion: 'think',
      },
      {
        page: 6,
        text:
          'Allah teaches us in this story: when He gives us something good, the right answer is to be grateful and share — not to be greedy.',
        emotion: 'happy',
      },
    ],
    activity: {
      type: 'order_events',
      prompt: 'Put the story in the right order',
      items: [
        { id: 'e1', text: 'A kind father shared fruit with poor people' },
        { id: 'e2', text: 'The sons decided to keep the fruit for themselves' },
        { id: 'e3', text: 'A wind destroyed the garden at night' },
        { id: 'e4', text: 'The brothers asked Allah for forgiveness' },
      ],
      lesson_question: {
        prompt: 'What is the main lesson of this story?',
        options: [
          'Be grateful and share what Allah gives you',
          'Always wake up early',
          'Trees can grow back fast',
          'Don\'t live near gardens',
        ],
        correctIndex: 0,
      },
    },
  },
  {
    id: 'story_kawthar_river',
    title: 'The River of Goodness',
    surah_reference: '108:1–3',
    summary:
      'Why a tiny surah — just three ayat — teaches the biggest lesson about gratitude.',
    cover_emotion: 'star',
    pages: [
      {
        page: 1,
        text:
          'In Makkah, some people teased Prophet Muhammad ﷺ. They said his message would be forgotten. They said his name would disappear.',
        emotion: 'think',
      },
      {
        page: 2,
        text:
          'Allah sent down a short but powerful surah. Just three ayat. It begins: "إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ — Indeed, We have granted you al-Kawthar."',
        emotion: 'surprise',
      },
      {
        page: 3,
        text:
          'Al-Kawthar is a beautiful river in Paradise. Its water is whiter than milk and sweeter than honey. But al-Kawthar is also every good thing Allah gave the Prophet ﷺ — knowledge, kindness, his family, and millions of people who would love him forever.',
        emotion: 'happy',
      },
      {
        page: 4,
        text:
          'Allah told the Prophet ﷺ: "So pray to your Lord and sacrifice." When you receive a great gift, the answer is not to brag — it is to thank Allah and give back to others.',
        emotion: 'smile',
      },
      {
        page: 5,
        text:
          'And the people who teased him? Their names are forgotten. But every five prayers, every Friday, every adhan around the world, the name of Muhammad ﷺ is honored. Allah kept His promise.',
        emotion: 'star',
      },
    ],
    activity: {
      type: 'order_events',
      prompt: 'Put the story in the right order',
      items: [
        { id: 'e1', text: 'People teased the Prophet ﷺ' },
        { id: 'e2', text: 'Allah revealed Surah Al-Kawthar' },
        { id: 'e3', text: 'The Prophet ﷺ was promised a river in Paradise' },
        { id: 'e4', text: 'The Prophet\'s ﷺ name is honored every day' },
      ],
      lesson_question: {
        prompt: 'When Allah gives us a great gift, we should…',
        options: [
          'Show off and brag',
          'Hide it from everyone',
          'Thank Allah and share with others',
          'Sell it quickly',
        ],
        correctIndex: 2,
      },
    },
  },
];

export function getStory(id) {
  return STORIES.find((s) => s.id === id) || null;
}
