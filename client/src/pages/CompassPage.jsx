// /compass — list of Quran Compass missions.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function CompassPage() {
  const [missions, setMissions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .compassMissions()
      .then((d) => !cancelled && setMissions(d.missions || []))
      .catch((e) => !cancelled && setError(e.message || 'Failed to load missions'));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-screen-md mx-auto px-4 pt-4 pb-28">
      <header className="mb-5">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl" aria-hidden>🧭</span>
          <h1 className="text-3xl font-extrabold text-ink">Quran Compass</h1>
        </div>
        <p className="text-ink-soft mt-2">
          Start with a real-life problem. Open six lenses from the Quran.
          Come back and answer with a Quran-shaped heart.
        </p>
      </header>

      {error && (
        <div className="text-sm text-accent-pink bg-accent-pink/10 border-2 border-accent-pink/30 rounded-2xl p-3 mb-4">
          {error}
        </div>
      )}

      {missions === null && !error && (
        <div className="text-ink-soft text-sm">Loading missions…</div>
      )}

      <ul className="grid gap-3">
        {missions?.map((m) => (
          <li key={m.id}>
            <Link
              to={`/compass/${m.id}`}
              className="block bg-cream border-2 border-accent-gold/40 rounded-3xl p-4 shadow-card hover:scale-[1.01] transition"
            >
              <div className="flex items-start gap-3">
                <div className="text-5xl leading-none" aria-hidden>{m.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-ink">{m.title}</div>
                  <div className="text-xs text-ink-faint font-semibold mt-0.5">
                    {m.subtitle}
                  </div>
                  <p className="text-sm text-ink-soft mt-2">{m.description}</p>
                  <div className="text-xs font-bold text-ink-soft mt-3">
                    🧭 {m.lensCount} lenses
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
