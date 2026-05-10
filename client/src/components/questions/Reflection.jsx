import { useState } from 'react';
import { Character } from '../Character.jsx';
import { SpeechBubble } from '../SpeechBubble.jsx';

// Open-ended reflection. Always counts as "correct" — the goal is to
// invite tadabbur, not to grade the child.
export function Reflection({ question, onAnswer, locked }) {
  const [text, setText] = useState('');

  const submit = () => {
    if (locked) return;
    onAnswer({
      correct: true,
      reflection: { prompt: question.prompt, text: text.trim() },
      noFeedback: true,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end gap-3">
        <Character emotion="quran_reading" size={96} />
        <SpeechBubble>
          <div className="text-sm font-bold text-accent-purple uppercase mb-1">
            Reflect
          </div>
          <div className="font-bold text-ink">{question.prompt}</div>
        </SpeechBubble>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your thoughts here… (optional)"
        rows={5}
        disabled={locked}
        className="w-full rounded-2xl border-2 border-gray-200 p-4 text-base font-medium focus:outline-none focus:border-accent-purple"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={locked}
          className="duo-btn-primary flex-1"
          style={{ background: '#CE82FF' }}
        >
          {text.trim() ? 'Save & Continue' : 'Skip for now'}
        </button>
      </div>
    </div>
  );
}
