import { useState } from 'react';
import { Character } from '../Character.jsx';

// Step 6 of the lesson flow: a real-life scenario connected to the lesson
// theme. The user picks the better response. The app explains gently,
// with a Quran connection. No negative sound or penalty screen.
export function MoralScenario({ question, onAnswer, locked }) {
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const check = () => {
    if (picked == null || locked) return;
    setRevealed(true);
  };

  const proceed = () => {
    if (!revealed || locked) return;
    const opt = question.options[picked];
    onAnswer({
      correct: opt.correct,
      noFeedback: true, // feedback is inline, not via FeedbackBar
      pickedText: opt.text,
      correctText: question.options.find((o) => o.correct)?.text,
    });
  };

  const chosenOpt = picked != null ? question.options[picked] : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Header pill */}
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase font-extrabold tracking-wide px-3 py-1 rounded-full bg-accent-orange/10 text-accent-orange">
          Moral Scenario
        </span>
      </div>

      {/* Scenario setup */}
      <div className="bg-cream border-2 border-accent-gold/40 rounded-3xl p-4 text-base text-ink leading-relaxed">
        {question.setup}
      </div>

      <h2 className="text-base font-extrabold text-ink">{question.question}</h2>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => {
          let cls = 'answer-card text-left';
          if (revealed && picked === i) {
            cls += opt.correct ? ' correct' : ' incorrect';
          } else if (!revealed && picked === i) {
            cls += ' selected';
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => !locked && !revealed && setPicked(i)}
              className={cls}
              disabled={revealed}
            >
              <span className="flex items-start gap-2">
                <span className={`mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-extrabold ${
                  picked === i ? 'border-accent-blue text-accent-blue' : 'border-gray-300 text-ink-faint'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{opt.text}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback after reveal */}
      {revealed && chosenOpt && (
        <div className={`rounded-2xl border-2 p-4 ${
          chosenOpt.correct
            ? 'bg-brand-50 border-brand-500/40'
            : 'bg-accent-orange/10 border-accent-orange/40'
        }`}>
          <div className="flex items-start gap-3">
            <Character
              emotion={chosenOpt.correct ? 'happy' : 'think'}
              size={60}
              className="shrink-0"
            />
            <div>
              <div className={`text-sm font-bold mb-1 ${chosenOpt.correct ? 'text-brand-600' : 'text-accent-orange'}`}>
                {chosenOpt.correct ? 'Well chosen.' : 'Let\'s think again.'}
              </div>
              <div className="text-sm text-ink">{chosenOpt.feedback}</div>
              {question.quran_connection && (
                <div className="mt-2 text-xs italic text-ink-soft border-l-2 border-accent-gold pl-2">
                  {question.quran_connection}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!revealed ? (
        <button
          type="button"
          onClick={check}
          disabled={picked == null || locked}
          className="duo-btn-primary"
          style={{ background: '#FF9600' }}
        >
          See what happens
        </button>
      ) : (
        <button
          type="button"
          onClick={proceed}
          disabled={locked}
          className="duo-btn-primary"
        >
          Continue
        </button>
      )}
    </div>
  );
}
