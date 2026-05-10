import { useState } from 'react';

// "Which ayah teaches X?" — pick from a list of ayat.
export function TapAyahLesson({ question, onAnswer, locked }) {
  const [selected, setSelected] = useState(null);

  const submit = () => {
    if (selected == null || locked) return;
    const opt = question.options[selected];
    onAnswer({
      correct: !!opt.correct,
      pickedText:
        opt.verse?.translation || opt.label || opt.verse_key || 'Selected option',
      correctText:
        question.options.find((o) => o.correct)?.verse?.translation ||
        question.options.find((o) => o.correct)?.label,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-extrabold text-ink">{question.prompt}</h2>

      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => {
          const isPicked = selected === i;
          const arabic = opt.verse?.text_uthmani;
          const translation = opt.verse?.translation;
          const label = opt.label;
          return (
            <button
              key={i}
              type="button"
              onClick={() => !locked && setSelected(i)}
              className={`answer-card text-left ${isPicked ? 'selected' : ''}`}
            >
              {arabic ? (
                <div>
                  <div className="font-arabic text-2xl text-ink mb-1">
                    {arabic}
                  </div>
                  {translation && (
                    <div className="text-xs text-ink-soft">{translation}</div>
                  )}
                  {opt.verse?.verse_key && (
                    <div className="text-[10px] mt-1 text-ink-faint">
                      {opt.verse.verse_key}
                    </div>
                  )}
                </div>
              ) : (
                <span>{label}</span>
              )}
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
