import { useState } from 'react';
import { AudioButton } from '../AudioButton.jsx';

// Play audio, then choose which ayah/translation matches.
export function ListenChoose({ question, onAnswer, locked }) {
  const [selected, setSelected] = useState(null);
  const audio = question.audio;

  const submit = () => {
    if (selected == null || locked) return;
    const opt = question.options[selected];
    onAnswer({
      correct: !!opt.correct,
      pickedText: opt.label,
      correctText: question.options.find((o) => o.correct)?.label,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-extrabold text-ink">{question.prompt}</h2>

      {audio?.audio_url && (
        <div className="flex justify-center py-4 bg-cream rounded-3xl border-2 border-accent-gold/40">
          <AudioButton src={audio.audio_url} large label="" />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => {
          const isPicked = selected === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => !locked && setSelected(i)}
              className={`answer-card text-right ${isPicked ? 'selected' : ''}`}
            >
              <span className="font-arabic text-xl block">{opt.label}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={selected == null || locked}
        className="duo-btn-primary"
      >
        Check
      </button>
    </div>
  );
}
