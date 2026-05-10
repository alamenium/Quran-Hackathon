import { useState } from 'react';

// Fill the missing word in an ayah by tapping one of the given options.
export function FillBlank({ question, onAnswer, locked }) {
  const [picked, setPicked] = useState(null);

  const submit = () => {
    if (!picked || locked) return;
    onAnswer({
      correct: picked === question.blank,
      pickedText: picked,
      correctText: question.blank,
    });
  };

  // Render the ayah_template, with "____" replaced by the picked word
  // (or a styled placeholder).
  const rendered = question.ayah_template.split('____');

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-extrabold text-ink">{question.prompt}</h2>

      <div className="bg-cream border-2 border-accent-gold/40 rounded-3xl p-5 text-center">
        <div className="font-arabic text-3xl text-ink leading-loose" dir="rtl">
          {rendered[0]}
          <span
            className={`inline-block mx-1 px-3 py-0.5 rounded-lg border-2 border-dashed ${
              picked
                ? 'border-brand-500 bg-brand-50 text-ink'
                : 'border-gray-300 text-ink-faint'
            }`}
          >
            {picked || '____'}
          </span>
          {rendered[1]}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => !locked && setPicked(opt)}
            className={`answer-card text-center ${picked === opt ? 'selected' : ''}`}
          >
            <span className="font-arabic text-2xl">{opt}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!picked || locked}
        className="duo-btn-primary"
      >
        Check
      </button>
    </div>
  );
}
