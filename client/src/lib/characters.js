// Character system.
//
// All character art lives at /characters/<id>/<id>_<emotion>.png. New characters
// can be added by dropping in a folder that follows the same naming scheme;
// the detection list is a small registry below.
//
// The system is *forgiving*: if a particular emotion file is missing for a
// character, it falls back to that character's "smile" image.

const REGISTRY = [
  {
    id: 'boy1',
    name: 'Yusuf',
    description: 'Curious and kind — loves stories.',
    emotions: [
      'smile',
      'happy',
      'think',
      'surprise',
      'scared',
      'star',
      'football',
      'quran_reading',
    ],
  },
  // To add a new character: copy these lines, set id to the folder name,
  // list the emotions present, and drop the PNGs into
  //   /client/public/characters/<id>/<id>_<emotion>.png
];

export function listCharacters() {
  return REGISTRY;
}

export function getCharacter(id) {
  return REGISTRY.find((c) => c.id === id) || REGISTRY[0];
}

// Resolve a character + emotion to an image URL.
export function characterImage(characterId, emotion = 'smile') {
  const char = getCharacter(characterId);
  const safeEmotion = char.emotions.includes(emotion) ? emotion : 'smile';
  return `/characters/${char.id}/${char.id}_${safeEmotion}.png`;
}
