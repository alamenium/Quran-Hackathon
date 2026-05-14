// /classes — list of recitation classes.
//
// Each class is a themed bundle of ayat the user practises reciting in
// order, scored by the faster-whisper sidecar (or Web Speech fallback).

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

const COLOR_TO_CLASSES = {
  gold:   { bg: 'bg-accent-gold/15',   ring: 'border-accent-gold/40',   text: 'text-accent-gold' },
  blue:   { bg: 'bg-accent-blue/10',   ring: 'border-accent-blue/40',   text: 'text-accent-blue' },
  purple: { bg: 'bg-accent-purple/10', ring: 'border-accent-purple/40', text: 'text-accent-purple' },
  pink:   { bg: 'bg-accent-pink/10',   ring: 'border-accent-pink/40',   text: 'text-accent-pink' },
  green:  { bg: 'bg-brand-500/10',     ring: 'border-brand-500/40',     text: 'text-brand-500' },
};

function colourClasses(c) {
  return COLOR_TO_CLASSES[c] || COLOR_TO_CLASSES.gold;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .classes()
      .then((data) => !cancelled && setClasses(data.classes || []))
      .catch((err) => !cancelled && setError(err.message || 'Failed to load classes'));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-screen-md mx-auto px-4 pt-4 pb-28">
      <header className="mb-5">
        <h1 className="text-3xl font-extrabold text-ink">Recitation Classes</h1>
        <p className="text-ink-soft mt-1">
          Practise reciting short surahs ayah by ayah. The AI listens and gives
          you a score.
        </p>
      </header>

      {error && (
        <div className="text-sm text-accent-pink bg-accent-pink/10 border-2 border-accent-pink/30 rounded-2xl p-3 mb-4">
          {error}
        </div>
      )}

      {classes === null && !error && (
        <div className="text-ink-soft text-sm">Loading classes…</div>
      )}

      {classes && classes.length === 0 && (
        <div className="text-ink-soft text-sm">
          No classes available yet. Check back soon.
        </div>
      )}

      <ul className="grid gap-3">
        {classes?.map((c) => {
          const cc = colourClasses(c.color);
          return (
            <li key={c.id}>
              <Link
                to={`/classes/${c.id}`}
                className={`block ${cc.bg} border-2 ${cc.ring} rounded-3xl p-4 shadow-card hover:scale-[1.01] transition`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-4xl leading-none" aria-hidden>
                    {c.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="font-extrabold text-ink truncate">
                        {c.title}
                      </div>
                      <div className={`text-[10px] uppercase font-extrabold tracking-wide ${cc.text}`}>
                        {c.level}
                      </div>
                    </div>
                    <div className="text-xs text-ink-faint font-semibold mt-0.5">
                      {c.subtitle}
                    </div>
                    <p className="text-sm text-ink-soft mt-2">{c.description}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs font-bold text-ink-soft">
                      <span>🎤 {c.verseCount} ayat</span>
                      <span>⭐ +{c.xp} XP</span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
