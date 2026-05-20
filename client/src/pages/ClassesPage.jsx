// /classes — Recite page. Listen, repeat, record, improve.
// Gracefully handles ASR being unavailable in basic dev mode.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

const LEVEL_COLOR = {
  beginner:     'text-brand-500 bg-brand-50 border-brand-200',
  intermediate: 'text-accent-orange bg-orange-50 border-orange-200',
  advanced:     'text-accent-pink bg-pink-50 border-pink-200',
};
function levelStyle(level) {
  return LEVEL_COLOR[level?.toLowerCase()] || LEVEL_COLOR.beginner;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState(null);
  const [asrStatus, setAsrStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.classes().catch((e) => { if (!cancelled) setError(e.message); return { classes: [] }; }),
      api.recitationStatus().catch(() => null),
    ]).then(([data, asr]) => {
      if (cancelled) return;
      setClasses(data.classes || []);
      setAsrStatus(asr);
    });
    return () => { cancelled = true; };
  }, []);

  const asrAvailable = asrStatus?.reachable || asrStatus?.configured;

  return (
    <div className="max-w-screen-md mx-auto px-4 pt-5 pb-28">
      {/* Page header */}
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink">Recite</h1>
        <p className="text-sm text-ink-soft mt-1">
          Listen, repeat, record, and improve.
        </p>
      </header>

      {/* ASR fallback banner — shows only when scoring is unavailable */}
      {asrStatus !== null && !asrAvailable && (
        <div className="flex items-start gap-3 bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-5">
          <span className="text-xl shrink-0 mt-0.5" aria-hidden>🎧</span>
          <div>
            <div className="font-extrabold text-amber-800 text-sm">
              Listen &amp; practise mode
            </div>
            <div className="text-xs text-amber-700 mt-0.5">
              Recitation scoring is unavailable in basic mode. You can still listen and practise along.
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-accent-pink bg-accent-pink/10 border-2 border-accent-pink/30 rounded-2xl p-3 mb-4">
          {error}
        </div>
      )}

      {classes === null && !error && (
        <div className="text-ink-soft text-sm">Loading…</div>
      )}

      {classes?.length === 0 && !error && (
        <div className="text-ink-soft text-sm text-center py-12">
          No surahs available yet. Check back soon.
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {classes?.map((c) => (
          <ReciteCard key={c.id} surah={c} asrAvailable={asrAvailable} />
        ))}
      </ul>
    </div>
  );
}

function ReciteCard({ surah: c, asrAvailable }) {
  return (
    <li>
      <div className="bg-white border-2 border-gray-100 rounded-3xl p-4 shadow-card">
        <div className="flex items-start gap-4">
          {/* Emoji + surah number */}
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex flex-col items-center justify-center">
            <span className="text-xl leading-none" aria-hidden>{c.emoji || '📖'}</span>
          </div>

          <div className="flex-1 min-w-0">
            {/* Title + level pill */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-ink text-sm">{c.title}</span>
              {c.level && (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wide ${levelStyle(c.level)}`}>
                  {c.level}
                </span>
              )}
            </div>

            {/* Subtitle / description */}
            {c.subtitle && (
              <div className="text-xs text-ink-faint mt-0.5">{c.subtitle}</div>
            )}
            {c.description && (
              <p className="text-sm text-ink-soft mt-1 line-clamp-2">{c.description}</p>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-3 mt-2.5 text-xs font-bold text-ink-soft">
              {c.verseCount && <span>📜 {c.verseCount} ayat</span>}
              {c.xp && <span>⭐ +{c.xp} XP</span>}
              {!asrAvailable && (
                <span className="text-amber-600">🎧 listen only</span>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          to={`/classes/${c.id}`}
          className="mt-4 block w-full py-2.5 rounded-2xl text-center text-sm font-extrabold text-white transition"
          style={{ background: '#58CC02' }}
        >
          {asrAvailable ? 'Start Practice' : 'Listen & Follow'}
        </Link>
      </div>
    </li>
  );
}
