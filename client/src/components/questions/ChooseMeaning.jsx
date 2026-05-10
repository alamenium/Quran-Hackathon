import { useState } from 'react';
import { Character } from '../Character.jsx';
import { SpeechBubble } from '../SpeechBubble.jsx';

// Multiple-choice meaning of an Arabic word.
export function ChooseMeaning({ question, onAnswer, locked }) {
  const [selected, setSelected] = useState(null);

  const submit = () => {
    if (selected == null || locked) return;
    onAnswer({
      correct: selected === question.correctIndex,
      pickedIndex: selected,
      correctText: question.options[question.correctIndex],
      pickedText: question.options[selected],
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end gap-3">
        <Character emotion="think" size={96} />
        <SpeechBubble>
          <div className="font-bold text-ink">{question.prompt}</div>
        </SpeechBubble>
      </div>

      {question.arabic && (
        <div className="text-center">
          <div className="font-arabic text-5xl text-ink py-2">
            {question.arabic}
          </div>
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
              className={`answer-card text-left ${isPicked ? 'selected' : ''}`}
              aria-pressed={isPicked}
            >
              <span className="inline-flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-md border-2 flex items-center justify-center text-xs ${
                    isPicked
                      ? 'border-accent-blue text-accent-blue'
                      : 'border-gray-200 text-ink-faint'
                  }`}
                >
                  {i + 1}
                </span>
                <span>{opt}</span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={selected == null || locked}
        className="duo-btn-primary mt-2"
      >
        Check
      </button>
    </div>
  );
}
