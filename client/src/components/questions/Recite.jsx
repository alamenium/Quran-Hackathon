// "Recite the ayah" question — live-caption flow.
//
// Behaviour:
//   1. Mic auto-starts on mount (no record button).
//   2. As the user recites, large Arabic captions appear in real time
//      (Web Speech API → interim + final results).
//   3. When the user stops talking, the browser fires `onend`. We then
//      automatically POST the transcript to /api/recitation/verify and
//      show the score. No "Check" button, no audio playback.
//   4. After the score, a single "Next" button advances. A small
//      "Restart" link lets the user redo the ayah.
//
// Browsers without Web Speech support (Firefox desktop today) fall back
// to a friendly skip — there's no MediaRecorder/Whisper UI in this view
// any more, by design.

import { useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition.js';
import { VerseCard } from '../VerseCard.jsx';
import { api } from '../../lib/api.js';

export function Recite({ question, onAnswer, locked }) {
  const verse = question.verse;
  const speech = useSpeechRecognition({ lang: 'ar-SA' });

  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [autoStartFailed, setAutoStartFailed] = useState(false);

  // Track whether we've already submitted this run so we don't double-fire
  // when React re-renders after onend.
  const submittedRef = useRef(false);

  // ---- Auto-start on mount -----------------------------------------------
  useEffect(() => {
    if (!speech.supported || locked) return;
    submittedRef.current = false;
    try {
      speech.start();
    } catch {
      setAutoStartFailed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verse?.verse_key]);

  // ---- Auto-submit when speech ends with a transcript ---------------------
  useEffect(() => {
    if (
      !speech.listening &&
      speech.transcript &&
      !submittedRef.current &&
      !verifying &&
      !result
    ) {
      submittedRef.current = true;
      verify(speech.transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.listening, speech.transcript]);

  const verify = async (transcriptText) => {
    setError(null);
    setVerifying(true);
    try {
      const res = await api.verifyRecitation(verse.verse_key, transcriptText);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Verification failed');
      submittedRef.current = false;
    } finally {
      setVerifying(false);
    }
  };

  const restart = () => {
    setResult(null);
    setError(null);
    submittedRef.current = false;
    speech.reset();
    try {
      speech.start();
    } catch {
      setAutoStartFailed(true);
    }
  };

  const accept = () => {
    if (locked) return;
    onAnswer({
      correct: !!result?.passed,
      recitation: {
        verse_key: verse.verse_key,
        passed: !!result?.passed,
        words: result?.words || [],
        transcript: result?.transcript,
      },
      pickedText: result?.transcript,
      correctText: verse.text_uthmani,
    });
  };

  const skip = () => {
    if (locked) return;
    onAnswer({ correct: true, noFeedback: true, skipped: true });
  };

  // ---- Render -----------------------------------------------------------

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-extrabold text-ink">{question.prompt}</h2>

      <VerseCard verse={verse} />

      <ModeBadge speech={speech} verifying={verifying} result={result} />

      {speech.supported ? (
        <LiveTranscript speech={speech} verifying={verifying} result={result} />
      ) : (
        <div className="text-sm text-ink-soft text-center bg-paper border-2 border-gray-100 rounded-2xl p-4">
          Live voice recognition isn't available on this browser.
          Try Chrome on Android or Safari on iOS, or tap Skip to continue.
        </div>
      )}

      {autoStartFailed && (
        <div className="text-sm text-accent-orange bg-accent-orange/10 border-2 border-accent-orange/30 rounded-2xl p-3">
          The mic didn't start automatically. Tap "Start listening" below.
          <button
            type="button"
            onClick={restart}
            className="ml-2 underline font-bold"
          >
            Start listening
          </button>
        </div>
      )}

      {error && (
        <div className="text-sm text-accent-pink bg-accent-pink/10 border-2 border-accent-pink/30 rounded-2xl p-3">
          {error}
          <button
            type="button"
            onClick={restart}
            className="ml-2 underline font-bold"
          >
            Try again
          </button>
        </div>
      )}

      {result && <ResultPanel result={result} />}

      <div className="grid grid-cols-2 gap-2 w-full">
        {result ? (
          <>
            <button
              type="button"
              onClick={accept}
              disabled={locked}
              className="duo-btn-primary"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={restart}
              disabled={locked}
              className="duo-btn-ghost"
            >
              Try again
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={skip}
            disabled={locked}
            className="duo-btn-ghost col-span-2"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function ModeBadge({ speech, verifying, result }) {
  const label = !speech.supported
    ? '⚠ Voice not supported on this browser'
    : verifying
    ? '⚙ Checking your recitation…'
    : result
    ? '✅ Done — see your score below'
    : speech.listening
    ? '🎙 Listening… recite the ayah'
    : '⏸ Paused';
  const colour = !speech.supported
    ? 'bg-accent-orange/10 text-accent-orange'
    : speech.listening
    ? 'bg-accent-blue/10 text-accent-blue animate-pulse-soft'
    : result
    ? 'bg-brand-500/10 text-brand-500'
    : 'bg-gray-100 text-ink-soft';
  return (
    <div className="flex justify-center">
      <span
        className={`inline-flex px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide ${colour}`}
      >
        {label}
      </span>
    </div>
  );
}

function LiveTranscript({ speech, verifying, result }) {
  // Hide the live caption box once we have a result — the result panel
  // shows the final transcript on its own.
  if (result) return null;

  const hasAnything = speech.transcript || speech.interim;
  return (
    <div className="bg-paper border-2 border-gray-100 rounded-2xl p-4 min-h-[120px] flex items-center justify-center">
      {hasAnything ? (
        <div
          className="font-arabic text-3xl text-ink leading-loose text-center"
          dir="rtl"
        >
          {speech.transcript}{' '}
          <span className="text-ink-faint">{speech.interim}</span>
        </div>
      ) : verifying ? (
        <div className="text-ink-soft text-sm">Checking…</div>
      ) : speech.listening ? (
        <div className="text-ink-faint text-sm">
          Start reciting — your words appear here in real time.
        </div>
      ) : (
        <div className="text-ink-faint text-sm">Getting the mic ready…</div>
      )}
    </div>
  );
}

// Render the canonical Quranic text (with full diacritization) word by word,
// colouring each word based on the comparison result:
//
//   match              — normal ink colour (the user said this word right,
//                        ignoring missing diacritics).
//   wrong-letters      — red    (different word entirely).
//   wrong-diacritics   — red    (right letters, wrong harakat).
//   missing            — grey   (user skipped this word).
//
// We always show the canonical's spelling, so dagger alif (ـٰ) and alef
// wasla (ٱ) appear exactly as in the Mushaf even if the user spoke a
// plain alif.
function ResultPanel({ result }) {
  const words = Array.isArray(result?.words) ? result.words : [];
  return (
    <div
      className={`w-full bg-cream border-2 rounded-2xl p-4 flex flex-col gap-3 ${
        result.passed ? 'border-brand-500/40' : 'border-accent-gold/40'
      }`}
    >
      <div
        className="font-arabic text-3xl text-ink leading-loose text-right"
        dir="rtl"
      >
        {words.map((w, i) => (
          <span key={i} className={wordClass(w.status)} title={w.status}>
            {w.word}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
      <div className="text-sm text-ink">{result.message}</div>
      <ResultLegend />
    </div>
  );
}

function wordClass(status) {
  switch (status) {
    case 'wrong-letters':
    case 'wrong-diacritics':
      return 'text-accent-pink';
    case 'missing':
      return 'text-ink-faint opacity-50';
    default:
      return 'text-ink';
  }
}

function ResultLegend() {
  return (
    <div className="flex items-center gap-3 text-[10px] uppercase font-bold text-ink-faint flex-wrap">
      <span className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-ink" />
        match
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-accent-pink" />
        wrong
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-ink-faint opacity-50" />
        missing (ok)
      </span>
    </div>
  );
}
