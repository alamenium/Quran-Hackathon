// /classes/:id — recitation class player (live-caption flow).
//
// Per ayah:
//   1. Mic auto-starts as soon as the verse loads (no record button).
//   2. Live Arabic captions appear as the user recites.
//   3. When the user goes silent, the transcript is automatically scored
//      against the canonical text via /api/recitation/verify.
//   4. Score appears with a "Next ayah" button.
//
// After the final verse, a summary screen shows average score, pass count,
// and a per-ayah breakdown.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { VerseCard } from '../components/VerseCard.jsx';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';

// Note: XP for completing a class is shown in the summary but not yet
// persisted via /api/progress. Wire it through completeQuest if/when the
// server gains a class-specific progress endpoint.

export default function ClassPage() {
  const { id } = useParams();
  const [klass, setKlass] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState([]);
  const [done, setDone] = useState(false);

  // Load class
  useEffect(() => {
    let cancelled = false;
    api
      .class(id)
      .then((data) => !cancelled && setKlass(data))
      .catch((err) => !cancelled && setLoadError(err.message || 'Failed to load class'));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const verse = klass?.verses?.[index];
  const total = klass?.verses?.length || 0;

  if (loadError) {
    return (
      <div className="max-w-screen-md mx-auto px-4 pt-6">
        <div className="text-sm text-accent-pink bg-accent-pink/10 border-2 border-accent-pink/30 rounded-2xl p-3">
          {loadError}
        </div>
        <Link to="/classes" className="duo-btn-ghost mt-4 inline-block">← Back to Classes</Link>
      </div>
    );
  }

  if (!klass) {
    return <div className="max-w-screen-md mx-auto px-4 pt-6 text-ink-soft">Loading…</div>;
  }

  if (done) {
    return <ClassSummary klass={klass} scores={scores} />;
  }

  return (
    <div className="max-w-screen-md mx-auto px-4 pt-4 pb-28">
      <ClassHeader klass={klass} index={index} total={total} />

      <div className="my-4">
        <VerseCard verse={verse} showTranslation showAudio />
      </div>

      <RecitePane
        // Re-mount per verse so the speech recogniser starts fresh.
        key={verse.verse_key}
        verse={verse}
        onScored={(scoreEntry) => {
          setScores((prev) => {
            const filtered = prev.filter((s) => s.verse_key !== scoreEntry.verse_key);
            return [...filtered, scoreEntry];
          });
        }}
        onAdvance={() => {
          if (index + 1 >= total) setDone(true);
          else setIndex(index + 1);
        }}
      />

      <ClassFooter
        index={index}
        total={total}
        onSkip={() => {
          if (index + 1 >= total) setDone(true);
          else setIndex(index + 1);
        }}
        onBack={() => setIndex(Math.max(0, index - 1))}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------

function ClassHeader({ klass, index, total }) {
  const pct = Math.round((index / Math.max(1, total)) * 100);
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-ink-faint">
        <Link to="/classes" className="hover:underline">Classes</Link>
        <span>›</span>
        <span className="font-bold text-ink-soft">{klass.title}</span>
      </div>
      <h1 className="text-2xl font-extrabold text-ink mt-1">
        <span className="mr-2" aria-hidden>{klass.emoji}</span>
        {klass.title}
      </h1>
      <div className="text-xs text-ink-faint font-semibold">
        Ayah {index + 1} of {total}
      </div>
      <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
        <div
          className="h-full bg-brand-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function RecitePane({ verse, onScored, onAdvance }) {
  const speech = useSpeechRecognition({ lang: 'ar-SA' });
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [autoStartFailed, setAutoStartFailed] = useState(false);
  const submittedRef = useRef(false);

  // Auto-start mic on mount.
  useEffect(() => {
    if (!speech.supported) return;
    submittedRef.current = false;
    try {
      speech.start();
    } catch {
      setAutoStartFailed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-submit on silence (onend with a transcript).
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
      onScored({
        verse_key: verse.verse_key,
        passed: !!res.passed,
        words: res.words || [],
        transcript: res.transcript || '',
      });
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

  return (
    <div className="bg-paper border-2 border-gray-100 rounded-3xl p-4 mt-2 flex flex-col gap-3">
      <ModeBadge speech={speech} verifying={verifying} result={result} />

      {speech.supported ? (
        <LiveTranscript speech={speech} verifying={verifying} result={result} />
      ) : (
        <div className="text-sm text-ink-soft text-center py-6">
          Live voice recognition isn't available on this browser.
          Try Chrome on Android or Safari on iOS, or tap Skip to continue.
        </div>
      )}

      {autoStartFailed && (
        <div className="text-sm text-accent-orange bg-accent-orange/10 border-2 border-accent-orange/30 rounded-2xl p-3">
          Mic didn't start.
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

      {result && (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onAdvance} className="duo-btn-primary">
            Next ayah →
          </button>
          <button type="button" onClick={restart} className="duo-btn-ghost">
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

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
      <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide ${colour}`}>
        {label}
      </span>
    </div>
  );
}

function LiveTranscript({ speech, verifying, result }) {
  if (result) return null;
  const hasAnything = speech.transcript || speech.interim;
  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 min-h-[120px] flex items-center justify-center">
      {hasAnything ? (
        <div className="font-arabic text-3xl text-ink leading-loose text-center" dir="rtl">
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

// Render the canonical Quranic text word by word, colouring each based on
// the comparison result (see server/src/services/recitation.js for the
// status definitions).
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
      <div className="flex items-center gap-3 text-[10px] uppercase font-bold text-ink-faint flex-wrap">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-ink" /> match
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-accent-pink" /> wrong
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-ink-faint opacity-50" /> missing (ok)
        </span>
      </div>
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

function ClassFooter({ index, total, onBack, onSkip }) {
  return (
    <div className="flex justify-between items-center mt-4">
      <button
        type="button"
        onClick={onBack}
        disabled={index === 0}
        className="text-sm font-bold text-ink-soft disabled:opacity-30"
      >
        ← Previous
      </button>
      <button
        type="button"
        onClick={onSkip}
        className="text-sm font-bold text-ink-soft underline"
      >
        {index + 1 >= total ? 'Finish' : 'Skip'}
      </button>
    </div>
  );
}

function ClassSummary({ klass, scores }) {
  const total = klass.verses.length;
  const passed = useMemo(
    () => scores.filter((s) => s.passed).length,
    [scores]
  );
  const attempted = scores.length;
  const skipped = total - attempted;

  return (
    <div className="max-w-screen-md mx-auto px-4 pt-6 pb-28 text-center">
      <div className="text-6xl mb-3">🎉</div>
      <h1 className="text-3xl font-extrabold text-ink">Class complete!</h1>
      <p className="text-ink-soft mt-1">{klass.title}</p>

      <div className="grid grid-cols-3 gap-3 mt-6 text-left">
        <div className="bg-cream border-2 border-accent-gold/40 rounded-2xl p-3">
          <div className="text-3xl font-extrabold text-brand-500">
            {passed}/{total}
          </div>
          <div className="text-xs font-bold uppercase text-ink-faint">Recited</div>
        </div>
        <div className="bg-cream border-2 border-accent-gold/40 rounded-2xl p-3">
          <div className="text-3xl font-extrabold text-accent-pink">
            {attempted - passed}
          </div>
          <div className="text-xs font-bold uppercase text-ink-faint">Mistakes</div>
        </div>
        <div className="bg-cream border-2 border-accent-gold/40 rounded-2xl p-3">
          <div className="text-3xl font-extrabold text-ink-soft">{skipped}</div>
          <div className="text-xs font-bold uppercase text-ink-faint">Skipped</div>
        </div>
      </div>

      <div className="mt-6 text-left">
        <h2 className="text-sm font-extrabold text-ink-soft uppercase mb-2">Per ayah</h2>
        <ul className="grid gap-2">
          {klass.verses.map((v) => {
            const s = scores.find((x) => x.verse_key === v.verse_key);
            let badge;
            if (!s) {
              badge = <span className="text-xs text-ink-faint">skipped</span>;
            } else if (s.passed) {
              badge = <span className="text-brand-500 font-extrabold">✓ correct</span>;
            } else {
              const wrong = (s.words || []).filter(
                (w) => w.status === 'wrong-letters' || w.status === 'wrong-diacritics'
              ).length;
              badge = (
                <span className="text-accent-pink font-extrabold">
                  ✗ {wrong} word{wrong === 1 ? '' : 's'} off
                </span>
              );
            }
            return (
              <li
                key={v.verse_key}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-3"
              >
                <span className="font-bold text-ink-soft">{v.verse_key}</span>
                {badge}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-6">
        <Link to="/classes" className="duo-btn-primary">More classes</Link>
        <Link to={`/classes/${klass.id}`} className="duo-btn-ghost">Practise again</Link>
      </div>
    </div>
  );
}
