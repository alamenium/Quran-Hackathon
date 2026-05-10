import { useEffect, useRef, useState } from 'react';

// Compact audio player styled to match the Duolingo "tap to listen" pill.
export function AudioButton({ src, label = 'Listen', large = false }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnd = () => setPlaying(false);
    const onPause = () => setPlaying(false);
    a.addEventListener('ended', onEnd);
    a.addEventListener('pause', onPause);
    return () => {
      a.removeEventListener('ended', onEnd);
      a.removeEventListener('pause', onPause);
    };
  }, []);

  // If src changes, stop and reset.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
    setPlaying(false);
  }, [src]);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      try {
        await a.play();
        setPlaying(true);
      } catch (err) {
        // autoplay blocked etc.
        setPlaying(false);
      }
    }
  };

  const sizeClasses = large
    ? 'w-20 h-20 text-4xl'
    : 'w-14 h-14 text-2xl';

  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause' : 'Play recitation'}
        className={`${sizeClasses} rounded-full bg-accent-blue text-white flex items-center justify-center duo-btn`}
        style={{ padding: 0 }}
      >
        {playing ? '❚❚' : '▶'}
      </button>
      {label && !large && (
        <span className="text-sm font-bold text-ink-soft">{label}</span>
      )}
      <audio ref={audioRef} src={src} preload="none" />
    </div>
  );
}
