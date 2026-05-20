// client/src/lib/sfx.js
//
// Sound effects for AyahQuest.
// Files live in /audio/sfx/ (served from client/public/).
//
// Usage:
//   import { sfx } from '../lib/sfx.js';
//   sfx.correct();   // right answer ✓
//   sfx.incorrect(); // wrong answer ✗
//   sfx.complete();  // lesson/quest complete 🎉
//   sfx.click();     // button tap
//
// All sounds are loaded lazily and played at reduced volume so they
// complement the UI without being jarring for children.
// SFX are silenced when the browser is muted or when the user has set
// `localStorage.aq_sfx = 'off'`.

function isMuted() {
  try { return localStorage.getItem('aq_sfx') === 'off'; } catch { return false; }
}

function play(src, volume = 0.55) {
  if (isMuted()) return;
  try {
    const audio = new Audio(src);
    audio.volume = volume;
    // Best-effort — don't let a failed play crash anything
    audio.play().catch(() => {});
  } catch {}
}

export const sfx = {
  // Confirmed correct answer
  correct:   () => play('/audio/sfx/correct.mp3', 0.6),
  // Wrong answer / mistake
  incorrect: () => play('/audio/sfx/incorrect.mp3', 0.5),
  // Quest / lesson complete
  complete:  () => play('/audio/sfx/complete.mp3', 0.65),
  // Generic button tap (used for primary CTAs)
  click:     () => play('/audio/sfx/click.mp3', 0.4),

  // Toggle mute — call with true to mute, false to unmute
  setMuted: (muted) => {
    try { localStorage.setItem('aq_sfx', muted ? 'off' : 'on'); } catch {}
  },
  isMuted,
};
