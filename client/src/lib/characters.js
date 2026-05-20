// Character system.
//
// Emotion images: /characters/<id>/<id>_<emotion>.png
// Profile pictures: /characters/profiles/<id>_pfp.png
//   Used in the header, drawer, and character-select cards — round crop,
//   full-body illustrated portrait style.
//
// `characterImage(id, emotion)` → full-body emotion image
// `profileImage(id)` → round portrait (pfp)
//
// The registry is the single source of truth. Adding a character means
// dropping the PNGs into the right folders and adding an entry here.

const REGISTRY = [
  {
    id: 'boy1',
    name: 'Yusuf',
    description: 'Curious and kind — loves stories.',
    gender: 'boy',
    emotions: ['smile', 'happy', 'think', 'surprise', 'scared', 'star', 'football', 'quran_reading'],
  },
  {
    id: 'boy2',
    name: 'Omar',
    description: 'Brave and cheerful — always ready.',
    gender: 'boy',
    emotions: ['smile', 'happy', 'think', 'surprise', 'scared', 'star', 'football', 'quran_reading'],
  },
  {
    id: 'boy3',
    name: 'Jamal',
    description: 'Thoughtful and patient — wise beyond his years.',
    gender: 'boy',
    emotions: ['smile', 'happy', 'think', 'surprise', 'scared', 'star', 'football', 'quran_reading'],
  },
  {
    id: 'boy4',
    name: 'Sami',
    description: 'Energetic and fun — loves a challenge.',
    gender: 'boy',
    emotions: ['smile', 'happy', 'think', 'surprise', 'scared', 'star', 'football', 'quran_reading'],
  },
  {
    id: 'girl1',
    name: 'Maryam',
    description: 'Gentle and wise — loves the Quran.',
    gender: 'girl',
    emotions: ['smile', 'happy', 'think', 'surprise', 'star', 'quran_reading'],
  },
  {
    id: 'girl2',
    name: 'Hana',
    description: 'Creative and joyful — always learning.',
    gender: 'girl',
    emotions: ['smile', 'happy', 'think', 'surprise', 'star', 'quran_reading'],
  },
];

export function listCharacters() {
  return REGISTRY;
}

export function getCharacter(id) {
  return REGISTRY.find((c) => c.id === id) || REGISTRY[0];
}

// Full-body emotion image (used in lessons, welcome screen, etc.)
export function characterImage(characterId, emotion = 'smile') {
  const char = getCharacter(characterId);
  const safeEmotion = char.emotions.includes(emotion) ? emotion : 'smile';
  return `/characters/${char.id}/${char.id}_${safeEmotion}.png`;
}

// Round portrait / profile picture (used in header, drawer, character-select cards)
export function profileImage(characterId) {
  const char = getCharacter(characterId);
  return `/characters/profiles/${char.id}_pfp.png`;
}
