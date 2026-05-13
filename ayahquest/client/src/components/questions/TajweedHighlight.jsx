import { AudioButton } from '../AudioButton.jsx';

// Step 4 of the lesson flow: one tajweed rule highlighted in context.
// The user sees the highlighted word, reads the rule name and explanation,
// and can tap the audio button to hear the correct pronunciation.
// This is purely educational — not graded. Always calls onAnswer(correct: true).
export function TajweedHighlight({ question, onAnswer, locked }) {
  const { rule, explanation, highlighted_word, audio } = question;

  return (
    <div className="flex flex-col gap-5">
      {/* Header pill */}
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase font-extrabold tracking-wide px-3 py-1 rounded-full bg-accent-purple/10 text-accent-purple">
          Tajweed Highlight
        </span>
      </div>

      <h2 className="text-lg font-extrabold text-ink">{rule}</h2>

      {/* Highlighted word display */}
      <div className="bg-cream border-2 border-accent-gold/40 rounded-3xl p-6 text-center">
        <div className="font-arabic text-5xl text-ink mb-3 leading-loose">
          <span className="relative inline-block">
            <span className="relative z-10">{highlighted_word}</span>
            <span
              className="absolute inset-0 -mx-1 rounded-lg opacity-30"
              style={{ background: '#CE82FF' }}
              aria-hidden
            />
          </span>
        </div>
        {audio?.audio_url && (
          <AudioButton src={audio.audio_url} label="Hear correct pronunciation" />
        )}
      </div>

      {/* Rule explanation */}
      <div className="bg-white border-2 border-accent-purple/20 rounded-2xl p-4">
        <div className="text-xs uppercase font-extrabold text-accent-purple mb-2">
          The Rule
        </div>
        <div className="text-sm text-ink leading-relaxed">{explanation}</div>
      </div>

      <button
        type="button"
        onClick={() => !locked && onAnswer({ correct: true, noFeedback: true })}
        disabled={locked}
        className="duo-btn"
        style={{ background: '#CE82FF' }}
      >
        Got it — Continue
      </button>
    </div>
  );
}
