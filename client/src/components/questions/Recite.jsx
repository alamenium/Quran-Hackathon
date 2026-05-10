// "Recite the ayah" question.
//
// Tries the AI path first: record real audio with MediaRecorder, send to
// /api/recitation/verify-audio which runs the DeepSpeech-Quran model in the
// Python sidecar. If the sidecar is unavailable (HTTP 503), falls back to
// the Web Speech API path: transcribe in the browser, send the transcript
// to /api/recitation/verify.
//
// On browsers that support neither (rare), the question offers a friendly
// "skip & continue" so a child is never blocked.

import { useEffect, useState } from 'react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder.js';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition.js';
import { VerseCard } from '../VerseCard.jsx';
import { api } from '../../lib/api.js';

export function Recite({ question, onAnswer, locked }) {
  const verse = question.verse;
  const recorder = useAudioRecorder();
  const speech = useSpeechRecognition({ lang: 'ar-SA' });

  const [asrUp, setAsrUp] = useState(null); // null=unknown, true/false
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [usedFallback, setUsedFallback] = useState(false);

  // Probe the AI sidecar once on mount so we can show the right UI.
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

  const aiMode = asrUp && recorder.supported;
  const fallbackMode = !aiMode && speech.supported;

  const verify = async () => {
    setError(null);
    setVerifying(true);
    try {
      let res;
      if (aiMode && recorder.blob) {
        res = await api.verifyRecitationAudio(verse.verse_key, recorder.blob);
      } else if (recorder.blob) {
        // AI was supposed to be up but might have died — try anyway, fall back on 503
        try {
          res = await api.verifyRecitationAudio(verse.verse_key, recorder.blob);
        } catch (err) {
          if (err.status === 503) {
            setUsedFallback(true);
            // No transcript available since recorder was used. Ask user to retry with mic API.
            setError(
              "The AI engine isn't responding. Tap the mic again and try the simple voice mode."
            );
            return;
          }
          throw err;
        }
      } else if (speech.transcript) {
        res = await api.verifyRecitation(verse.verse_key, speech.transcript);
      } else {
        setError('Please record yourself reciting first.');
        return;
      }
      setResult(res);
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const accept = () => {
    if (locked) return;
    const score = result?.score ?? 0;
    onAnswer({
      correct: score >= 65,
      recitation: {
        verse_key: verse.verse_key,
        score,
        transcript: result?.transcript,
        source: result?.source,
      },
      pickedText: result?.transcript,
      correctText: verse.text_uthmani,
    });
  };

  const skip = () => {
    if (locked) return;
    onAnswer({ correct: true, noFeedback: true, skipped: true });
  };

  const resetAll = () => {
    recorder.reset();
    speech.reset();
    setResult(null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-extrabold text-ink">{question.prompt}</h2>

      <VerseCard verse={verse} />

      {/* Mode badge */}
      <div className="flex items-center justify-center">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide ${
            aiMode
              ? 'bg-brand-500/10 text-brand-500'
              : fallbackMode
              ? 'bg-accent-blue/10 text-accent-blue'
              : 'bg-accent-orange/10 text-accent-orange'
          }`}
        >
          {asrUp === null ? (
            <>⚙ checking…</>
          ) : aiMode ? (
            <>🤖 AI Quran Recognition</>
          ) : fallbackMode ? (
            <>🎙 Voice Recognition (basic)</>
          ) : (
            <>⚠ Voice not supported on this browser</>
          )}
        </span>
      </div>

      {/* AI / recorder UI */}
      {aiMode && (
        <RecorderUI
          recorder={recorder}
          locked={locked || verifying}
          onReset={resetAll}
        />
      )}

      {/* Web Speech fallback UI */}
      {!aiMode && fallbackMode && (
        <SpeechUI speech={speech} locked={locked || verifying} />
      )}

      {error && (
        <div className="text-sm text-accent-pink bg-accent-pink/10 border-2 border-accent-pink/30 rounded-2xl p-3">
          {error}
        </div>
      )}

      {result && (
        <ResultPanel result={result} usedFallback={usedFallback} />
      )}

      <div className="grid grid-cols-2 gap-2 w-full">
        <button
          type="button"
          onClick={result ? accept : verify}
          disabled={
            locked ||
            verifying ||
            (!result && !recorder.blob && !speech.transcript)
          }
          className="duo-btn-primary"
        >
          {verifying
            ? 'Checking…'
            : result
            ? 'Continue'
            : 'Check My Recitation'}
        </button>
        <button
          type="button"
          onClick={skip}
          disabled={locked}
          className="duo-btn-ghost"
        >
          Skip
        </button>
      </div>

      {!aiMode && !fallbackMode && (
        <div className="text-xs text-ink-soft text-center">
          Voice recognition isn't available on this browser. You can listen to
          the audio above and tap Skip when you're ready to continue.
        </div>
      )}
    </div>
  );
}

// --- Sub-components --------------------------------------------------------

function RecorderUI({ recorder, locked, onReset }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={recorder.recording ? recorder.stop : recorder.start}
        disabled={locked}
        className={`duo-btn ${recorder.recording ? 'animate-pulse-soft' : ''}`}
        style={{
          background: recorder.recording ? '#FF4B4B' : '#1CB0F6',
          width: 96,
          height: 96,
          borderRadius: '999px',
          fontSize: 36,
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
      {recorder.blob && !recorder.recording && (
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-ink-soft underline"
        >
          Discard and try again
        </button>
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
          width: 96,
          height: 96,
          borderRadius: '999px',
          fontSize: 36,
        }}
        aria-label={speech.listening ? 'Stop' : 'Start'}
      >
        {speech.listening ? '■' : '🎤'}
      </button>
      <div className="text-sm text-ink-soft text-center">
        {speech.listening
          ? 'Listening… recite slowly and clearly'
          : 'Tap the mic and recite the ayah'}
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

function ResultPanel({ result, usedFallback }) {
  return (
    <div className="w-full bg-cream border-2 border-accent-gold/40 rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <div className="text-3xl font-extrabold text-brand-500">
          {result.score}
          <span className="text-base text-ink-faint">/100</span>
        </div>
        <div className="text-xs uppercase font-bold text-ink-faint">
          {result.status}
        </div>
      </div>
      <div className="text-sm text-ink">{result.message}</div>
      {result.transcript && (
        <div className="font-arabic text-xl text-ink-soft mt-1" dir="rtl">
          {result.transcript}
        </div>
      )}
      <div className="text-[10px] text-ink-faint">
        Engine:{' '}
        {result.source === 'deepspeech-quran'
          ? 'DeepSpeech-Quran AI'
          : 'Web Speech API'}
        {usedFallback ? ' (fallback)' : ''}
      </div>
    </div>
  );
}
