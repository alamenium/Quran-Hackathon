// Web Speech API wrapper for live Arabic transcription.
//
// We use the browser's SpeechRecognition with lang='ar-SA' to get a
// transcript of the user reciting an ayah. The transcript is then sent
// to /api/recitation/verify which compares it to the canonical Arabic
// text (after stripping diacritics and unifying letter forms).
//
// Browser support: Chrome/Edge desktop & mobile, Safari iOS 14.5+. On
// unsupported browsers we expose `supported = false` so the UI can
// gracefully offer audio replay instead.

import { useEffect, useRef, useState, useCallback } from 'react';

const SR =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

export function useSpeechRecognition({ lang = 'ar-SA' } = {}) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const supported = Boolean(SR);

  const start = useCallback(() => {
    if (!SR) {
      setError(
        'Voice input is not supported on this browser. Try Chrome on Android or Safari on iOS.'
      );
      return;
    }
    setError(null);
    setTranscript('');
    setInterim('');

    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setListening(true);
    rec.onresult = (e) => {
      let finalText = '';
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const piece = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += piece + ' ';
        else interimText += piece;
      }
      if (finalText) setTranscript((t) => (t + ' ' + finalText).trim());
      setInterim(interimText.trim());
    };
    rec.onerror = (e) => {
      setError(e.error || 'recognition_error');
    };
    rec.onend = () => {
      setListening(false);
      setInterim('');
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      setError(err.message);
    }
  }, [lang]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setInterim('');
    setError(null);
  }, []);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  return { supported, listening, transcript, interim, error, start, stop, reset };
}
