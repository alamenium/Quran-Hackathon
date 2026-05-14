// /classes/:id — recitation class player.
//
// Walks the user verse-by-verse through a class:
//   1. Show the verse (Arabic + translation), play the canonical audio.
//   2. User taps the mic and recites.
//   3. Audio is sent to /api/recitation/verify-audio (faster-whisper) — or,
//      if the sidecar is down, the browser's Web Speech API transcribes
//      live and we POST to /api/recitation/verify instead.
//   4. Show the score, let them retry, then advance to the next verse.
//   5. After the final verse, show a summary with the average score.
//
// Mode (AI vs Web Speech) is decided once on mount via /api/recitation/asr-status,
// matching the behaviour of the Recite question component.

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { VerseCard } from '../components/VerseCard.jsx';
import { useAudioRecorder } from '../hooks/useAudioRecorder.js';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';

// Note: XP for completing a class is shown in the summary but not yet
// persisted via /api/progress. Wire it through completeQuest if/when the
// server gains a class-specific progress endpoint.

export default function ClassPage() {
  const { id } = useParams();
  const [klass, setKlass] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // ASR availability is probed once on mount.
  const [asrUp, setAsrUp] = useState(null);

  // Per-verse state
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState([]); // { verse_key, score, transcript, source }
  const [done, setDone] = useState(false);

  const recorder = useAudioRecorder();
  const speech = useSpeechRecognition({ lang: 'ar-SA' });

  const aiMode = asrUp && recorder.supported;
  const fallbackMode = !aiMode && speech.supported;

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

  // Probe ASR
  useEffect(() => {
    let cancelled = false;
    api
      .asrStatus()
      .then((s) => !cancelled && setAsrUp(!!(s.available && s.model_loaded)))
      .catch(() => !cancelled && setAsrUp(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const verse = klass?.verses?.[index];
  const total = klass?.verses?.length || 0;

  // Whenever we move to a new verse, clear the recorder/speech state.
  useEffect(() => {
    recorder.reset();
    speech.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

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

      <ModeBadge asrUp={asrUp} aiMode={aiMode} fallbackMode={fallbackMode} />

      <div className="my-4">
        <VerseCard verse={verse} showTranslation showAudio />
      </div>

      <ReciteCard
        verse={verse}
        recorder={recorder}
        speech={speech}
        aiMode={aiMode}
        fallbackMode={fallbackMode}
        onScored={(scoreEntry) => {
          setScores((prev) => {
            // Replace any prior attempt for the same verse so retries
            // overwrite, not duplicate.
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
  const pct = Math.round(((index) / Math.max(1, total)) * 100);
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

function ModeBadge({ asrUp, aiMode, fallbackMode }) {
  const label =
    asrUp === null
      ? '⚙ checking…'
      : aiMode
      ? '🤖 AI Quran Recognition'
      : fallbackMode
      ? '🎙 Voice Recognition (basic)'
      : '⚠ Voice not supported on this browser';
  const colour =
    asrUp === null
      ? 'bg-gray-100 text-ink-soft'
      : aiMode
      ? 'bg-brand-500/10 text-brand-500'
      : fallbackMode
      ? 'bg-accent-blue/10 text-accent-blue'
      : 'bg-accent-orange/10 text-accent-orange';
  return (
    <div className="flex justify-center mt-3">
      <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide ${colour}`}>
        {label}
      </span>
    </div>
  );
}

function ReciteCard({ verse, recorder, speech, aiMode, fallbackMode, onScored, onAdvance }) {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Reset card-local state whenever we get a new verse.
  useEffect(() => {
    setResult(null);
    setError(null);
  }, [verse?.verse_key]);

  const verify = async () => {
    setError(null);
    setVerifying(true);
    try {
      let res;
      if (aiMode && recorder.blob) {
        try {
          res = await api.verifyRecitationAudio(verse.verse_key, recorder.blob);
        } catch (err) {
          if (err.status === 503) {
            setError(
              "The AI engine isn't reachable right now. Try the simple voice mode by reloading the page."
            );
            return;
          }
          throw err;
        }
      } else if (fallbackMode && speech.transcript) {
        res = await api.verifyRecitation(verse.verse_key, speech.transcript);
      } else {
        setError(
          aiMode
            ? 'Please record yourself reciting first.'
            : 'Please tap the mic and recite the ayah first.'
        );
        return;
      }
      setResult(res);
      onScored({
        verse_key: verse.verse_key,
        score: res.score ?? 0,
        transcript: res.transcript || '',
        source: res.source || 'unknown',
      });
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="bg-paper border-2 border-gray-100 rounded-3xl p-4 mt-2">
      {aiMode && (
        <RecorderUI
          recorder={recorder}
          locked={verifying}
        />
      )}
      {!aiMode && fallbackMode && (
        <SpeechUI speech={speech} locked={verifying} />
      )}
      {!aiMode && !fallbackMode && (
        <div className="text-sm text-ink-soft text-center py-6">
          Voice recognition isn't available on this browser. Listen to the
          ayah above and tap Skip to continue.
        </div>
      )}

      {error && (
        <div className="text-sm text-accent-pink bg-accent-pink/10 border-2 border-accent-pink/30 rounded-2xl p-3 mt-3">
          {error}
        </div>
      )}

      {result && <ResultPanel result={result} />}

      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          type="button"
          onClick={result ? onAdvance : verify}
          disabled={
            verifying ||
            (!result && !recorder.blob && !speech.transcript)
          }
          className="duo-btn-primary"
        >
          {verifying ? 'Checking…' : result ? 'Next ayah →' : 'Check My Recitation'}
        </button>
        <button
          type="button"
          onClick={() => {
            recorder.reset();
            speech.reset();
            setResult(null);
            setError(null);
          }}
          disabled={verifying}
          className="duo-btn-ghost"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function RecorderUI({ recorder, locked }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={recorder.recording ? recorder.stop : recorder.start}
        disabled={locked}
        className={`duo-btn ${recorder.recording ? 'animate-pulse-soft' : ''}`}
        style={{
          background: recorder.recording ? '#FF4B4B' : '#1CB0F6',
          width: 96, height: 96, borderRadius: '999px', fontSize: 36,
        }}
        aria-label={recorder.recording ? 'Stop recording' : 'Start recording'}
      >
        {recorder.recording ? '■' : '🎤'}
      </button>
      <div className="text-sm text-ink-soft text-center">
        {recorder.recording
          ? `Listening… ${recorder.duration.toFixed(1)}s`
          : recorder.blob
          ? 'Got it! Tap Check below — or the mic to record again.'
          : 'Tap the mic and recite the ayah'}
      </div>
      {recorder.blob && !recorder.recording && (
        <audio
          src={URL.createObjectURL(recorder.blob)}
          controls
          className="w-full max-w-xs"
        />
      )}
      {recorder.error && (
        <div className="text-sm text-accent-pink">{recorder.error}</div>
      )}
    </div>
  );
}

function SpeechUI({ speech, locked }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={speech.listening ? speech.stop : speech.start}
        disabled={locked}
        className={`duo-btn ${speech.listening ? 'animate-pulse-soft' : ''}`}
        style={{
          background: speech.listening ? '#FF4B4B' : '#1CB0F6',
          width: 96, height: 96, borderRadius: '999px', fontSize: 36,
        }}
        aria-label={speech.listening ? 'Stop' : 'Start'}
      >
        {speech.listening ? '■' : '🎤'}
      </button>
      <div className="text-sm text-ink-soft text-center">
        {speech.listening ? 'Listening… recite slowly' : 'Tap the mic and recite'}
      </div>
      {(speech.transcript || speech.interim) && (
        <div className="w-full bg-paper border-2 border-gray-200 rounded-2xl p-3">
          <div className="text-xs uppercase font-bold text-ink-faint mb-1">
            What we heard
          </div>
          <div className="font-arabic text-2xl text-ink" dir="rtl">
            {speech.transcript}{' '}
            <span className="text-ink-faint">{speech.interim}</span>
          </div>
        </div>
      )}
      {speech.error && (
        <div className="text-sm text-accent-pink">
          Mic error: {speech.error}. Make sure you allowed microphone access.
        </div>
      )}
    </div>
  );
}

function ResultPanel({ result }) {
  return (
    <div className="w-full bg-cream border-2 border-accent-gold/40 rounded-2xl p-4 mt-3 flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <div className="text-3xl font-extrabold text-brand-500">
          {result.score}
          <span className="text-base text-ink-faint">/100</span>
        </div>
        <div className="text-xs uppercase font-bold text-ink-faint">{result.status}</div>
      </div>
      <div className="text-sm text-ink">{result.message}</div>
      {result.transcript && (
        <div className="font-arabic text-xl text-ink-soft mt-1" dir="rtl">
          {result.transcript}
        </div>
      )}
      <div className="text-[10px] text-ink-faint">
        Engine: {result.source === 'whisper' ? 'Whisper AI (Arabic)' : 'Web Speech API'}
      </div>
    </div>
  );
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
  const avg = useMemo(() => {
    if (!scores.length) return 0;
    return Math.round(scores.reduce((s, x) => s + (x.score || 0), 0) / scores.length);
  }, [scores]);
  const passed = scores.filter((s) => s.score >= 65).length;

  return (
    <div className="max-w-screen-md mx-auto px-4 pt-6 pb-28 text-center">
      <div className="text-6xl mb-3">🎉</div>
      <h1 className="text-3xl font-extrabold text-ink">Class complete!</h1>
      <p className="text-ink-soft mt-1">{klass.title}</p>

      <div className="grid grid-cols-3 gap-3 mt-6 text-left">
        <div className="bg-cream border-2 border-accent-gold/40 rounded-2xl p-3">
          <div className="text-3xl font-extrabold text-brand-500">{avg}</div>
          <div className="text-xs font-bold uppercase text-ink-faint">Avg score</div>
        </div>
        <div className="bg-cream border-2 border-accent-gold/40 rounded-2xl p-3">
          <div className="text-3xl font-extrabold text-brand-500">
            {passed}/{klass.verses.length}
          </div>
          <div className="text-xs font-bold uppercase text-ink-faint">Passed</div>
        </div>
        <div className="bg-cream border-2 border-accent-gold/40 rounded-2xl p-3">
          <div className="text-3xl font-extrabold text-brand-500">+{klass.xp}</div>
          <div className="text-xs font-bold uppercase text-ink-faint">XP earned</div>
        </div>
      </div>

      <div className="mt-6 text-left">
        <h2 className="text-sm font-extrabold text-ink-soft uppercase mb-2">Per ayah</h2>
        <ul className="grid gap-2">
          {klass.verses.map((v) => {
            const s = scores.find((x) => x.verse_key === v.verse_key);
            return (
              <li
                key={v.verse_key}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-3"
              >
                <span className="font-bold text-ink-soft">{v.verse_key}</span>
                {s ? (
                  <span className={`font-extrabold ${s.score >= 65 ? 'text-brand-500' : 'text-accent-orange'}`}>
                    {s.score}/100
                  </span>
                ) : (
                  <span className="text-xs text-ink-faint">skipped</span>
                )}
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

