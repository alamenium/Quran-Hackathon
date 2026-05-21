// client/src/components/GuessProphetGame.jsx
//
// "Guess the Prophet" / "من هو النبي؟"
//
// All Quran text and translations in this component come from the backend
// /api/games/guess-prophet endpoint, which in turn fetches from the Quran
// Foundation Content API (with graceful local fallback). This component
// does NOT hard-code any Quran content.
//
// Visual safety: every illustration is purely object-based (no faces,
// silhouettes, robes, hands, or human figures). See ProphetSceneSvg.jsx.

import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { sfx } from '../lib/sfx.js';
import { ProphetSceneSvg } from './ProphetSceneSvg.jsx';

export function GuessProphetGame({ onClose, embedded = false }) {
  const [cards, setCards] = useState(null);
  const [error, setError] = useState(null);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);     // selected answer (string) or null
  const [revealed, setRevealed] = useState(false);  // has the answer been checked yet
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setCards(null); setError(null);
    api.games.guessProphet()
      .then((data) => { if (!cancelled) setCards(data.cards || []); })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load the game.');
      });
    return () => { cancelled = true; };
  }, []);

  // Restart
  const restart = () => {
    setIdx(0); setPicked(null); setRevealed(false); setScore(0); setDone(false);
    setCards(null); setError(null);
    api.games.guessProphet()
      .then((data) => setCards(data.cards || []))
      .catch((err) => setError(err.message || 'Failed to load the game.'));
  };

  // Loading
  if (!cards && !error) {
    return (
      <div className={wrapperClass(embedded)}>
        <h3 className="text-lg font-extrabold text-ink mb-1">Guess the Prophet</h3>
        <div className="text-xs text-ink-faint mb-4" dir="rtl">من هو النبي؟</div>
        <div className="text-sm text-ink-soft text-center py-8">
          Loading clues from the Quran…
        </div>
      </div>
    );
  }

  // Error — no silent fallback to invented content (per the brief)
  if (error) {
    return (
      <div className={wrapperClass(embedded)}>
        <h3 className="text-lg font-extrabold text-ink mb-1">Guess the Prophet</h3>
        <div className="text-xs text-ink-faint mb-4" dir="rtl">من هو النبي؟</div>
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
          <div className="text-2xl mb-2" aria-hidden>📡</div>
          <p className="text-sm font-bold text-red-800 mb-3">
            Could not load the story clues. Please try again.
          </p>
          <button
            type="button"
            onClick={restart}
            className="duo-btn-ghost text-xs px-4 py-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Done
  if (done) {
    return (
      <div className={wrapperClass(embedded)}>
        <div className="text-center py-2">
          <div className="text-5xl mb-2" aria-hidden>🌟</div>
          <h3 className="text-lg font-extrabold text-ink mb-1">Great job!</h3>
          <p className="text-sm text-ink-soft mb-1">
            You learned clues from the stories of the Prophets.
          </p>
          <p className="text-base font-extrabold text-ink mt-2" dir="rtl">
            أحسنت! تعلمت إشارات من قصص الأنبياء.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-brand-50 border-2 border-brand-200 rounded-full px-4 py-1.5">
            <span className="text-sm font-extrabold text-brand-600">
              {score} / {cards.length}
            </span>
            <span className="text-xs text-ink-soft">correct</span>
          </div>
          <div className="mt-5 flex flex-col gap-2 items-stretch">
            <button
              type="button"
              onClick={() => { sfx.click(); restart(); }}
              className="duo-btn-primary text-sm"
            >
              Play again
            </button>
            {onClose && (
              <button
                type="button"
                onClick={() => { sfx.click(); onClose(); }}
                className="duo-btn-ghost text-sm"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const card = cards[idx];
  const correct = picked === card.answer;

  function pick(choice) {
    if (revealed) return;
    sfx.click();
    setPicked(choice);
  }

  function check() {
    if (!picked || revealed) return;
    setRevealed(true);
    if (picked === card.answer) {
      sfx.correct();
      setScore((s) => s + 1);
    } else {
      sfx.incorrect();
    }
  }

  function next() {
    sfx.click();
    if (idx + 1 >= cards.length) {
      sfx.complete();
      setDone(true);
    } else {
      setIdx(idx + 1);
      setPicked(null);
      setRevealed(false);
    }
  }

  function tryAgain() {
    sfx.click();
    setPicked(null);
    setRevealed(false);
  }

  // ── Round view ─────────────────────────────────────────────────────────
  return (
    <div className={wrapperClass(embedded)}>
      {/* Header */}
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h3 className="text-lg font-extrabold text-ink leading-tight">Guess the Prophet</h3>
          <div className="text-xs text-ink-faint" dir="rtl">من هو النبي؟</div>
        </div>
        <div className="text-xs font-extrabold text-ink-soft tabular-nums">
          {idx + 1} / {cards.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-brand-500 transition-all duration-300"
          style={{ width: `${((idx + (revealed ? 1 : 0)) / cards.length) * 100}%` }}
        />
      </div>

      {/* Symbolic scene */}
      <ProphetSceneSvg
        type={card.imageType}
        alt={card.alt}
        className="mb-3 rounded-2xl overflow-hidden border-2 border-gray-100"
      />

      {/* Clue */}
      <p className="text-sm text-ink leading-relaxed mb-1">
        <span className="font-bold text-brand-600">Clue: </span>
        {card.childFriendlyClue}
      </p>


      {/* Answer choices */}
      <div className="grid gap-2 mb-4" role="radiogroup" aria-label="Choose the Prophet">
        {card.answerChoices.map((choice) => {
          const isPicked  = picked === choice;
          const isCorrect = revealed && choice === card.answer;
          const isWrong   = revealed && isPicked && choice !== card.answer;
          let cls = 'answer-card text-sm py-2.5';
          if (isCorrect)     cls += ' correct';
          else if (isWrong)  cls += ' incorrect';
          else if (isPicked) cls += ' selected';
          return (
            <button
              key={choice}
              type="button"
              role="radio"
              aria-checked={isPicked}
              disabled={revealed && !isPicked && !isCorrect}
              onClick={() => pick(choice)}
              className={cls}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {/* CTA — check / next / try again */}
      {!revealed && (
        <button
          type="button"
          onClick={check}
          disabled={!picked}
          className="duo-btn-primary w-full text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Check
        </button>
      )}
      {revealed && correct && (
        <button type="button" onClick={next} className="duo-btn-primary w-full text-sm">
          {idx + 1 >= cards.length ? 'See result' : 'Next Story →'}
        </button>
      )}
      {revealed && !correct && (
        <div className="flex flex-col gap-2">
          <div className="text-center text-xs text-ink-soft">
            The Prophet was <span className="font-extrabold text-ink">{card.answer}</span>{' '}
            <span dir="rtl">({card.arabicAnswer})</span>
          </div>
          <button type="button" onClick={tryAgain} className="duo-btn-ghost w-full text-sm">
            Try again
          </button>
          <button type="button" onClick={next} className="duo-btn-primary w-full text-sm">
            {idx + 1 >= cards.length ? 'See result' : 'Next Story →'}
          </button>
        </div>
      )}
    </div>
  );
}

function wrapperClass(embedded) {
  return embedded
    ? 'bg-white border-2 border-gray-100 rounded-3xl shadow-card p-5'
    : 'bg-white border-2 border-gray-100 rounded-3xl shadow-card p-5 max-w-md mx-auto';
}
