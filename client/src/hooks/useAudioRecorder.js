// MediaRecorder-based audio capture.
//
// Records short audio clips from the user's microphone for upload to the
// DeepSpeech-Quran ASR sidecar. The browser picks the encoding (Chrome →
// WebM/Opus, Firefox → OGG/Opus, Safari → MP4/AAC); the Python service
// uses ffmpeg to decode whatever it receives.
//
// Browser support: MediaRecorder is available everywhere modern (Chrome,
// Firefox, Safari 14.1+, Edge). On unsupported environments `supported`
// is false and the UI falls back to the Web Speech API path.

import { useEffect, useRef, useState, useCallback } from 'react';

export function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState(null);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);

  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const startedAtRef = useRef(0);
  const durationTimerRef = useRef(null);

  const supported =
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices;

  const start = useCallback(async () => {
    if (!supported) {
      setError('Audio recording is not supported on this browser.');
      return;
    }
    setError(null);
    setBlob(null);
    setDuration(0);
    chunksRef.current = [];

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      setError(
        err?.name === 'NotAllowedError'
          ? "Microphone access was blocked. You'll need to allow it in your browser settings to recite."
          : `Couldn't open the microphone: ${err.message}`
      );
      return;
    }

    // Pick the most-compatible mime type the browser supports.
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      '',
    ];
    let mimeType = '';
    for (const c of candidates) {
      if (
        !c ||
        (window.MediaRecorder.isTypeSupported &&
          window.MediaRecorder.isTypeSupported(c))
      ) {
        mimeType = c;
        break;
      }
    }

    let rec;
    try {
      rec = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
    } catch (err) {
      setError(`MediaRecorder failed: ${err.message}`);
      stream.getTracks().forEach((t) => t.stop());
      return;
    }

    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      const finalType = rec.mimeType || mimeType || 'audio/webm';
      setBlob(new Blob(chunksRef.current, { type: finalType }));
      stream.getTracks().forEach((t) => t.stop());
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    };
    rec.onerror = (e) => setError(e.error?.message || 'Recording error');

    mediaRef.current = rec;
    startedAtRef.current = Date.now();
    rec.start();
    setRecording(true);

    durationTimerRef.current = setInterval(() => {
      setDuration((Date.now() - startedAtRef.current) / 1000);
    }, 100);
  }, [supported]);

  const stop = useCallback(() => {
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop();
    }
    setRecording(false);
  }, []);

  const reset = useCallback(() => {
    setBlob(null);
    setDuration(0);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRef.current && mediaRef.current.state !== 'inactive') {
        mediaRef.current.stop();
      }
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, []);

  return { supported, recording, blob, duration, error, start, stop, reset };
}
