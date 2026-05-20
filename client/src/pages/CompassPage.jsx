// /compass — Quran Compass page.
// Purpose: help the child explore one Quranic value through connected
// ayat, stories, and reflection.
// Each card shows: title, goal, Quran reference, lenses count, status.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useProgress } from '../context/ProgressContext.jsx';

export default function CompassPage() {
  const { user } = useProgress();
  const [missions, setMissions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .compassMissions()
      .then((d) => !cancelled && setMissions(d.missions || []))
      .catch((e) => !cancelled && setError(e.message || 'Failed to load missions'));
    return () => { cancelled = true; };
  }, []);

  const completedSet = new Set((user?.completedQuests || []).map((q) => q.questId));

  return (
    <div className="max-w-screen-md mx-auto px-4 pt-5 pb-28">
      {/* Page header */}
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink">Compass</h1>
        <p className="text-sm text-ink-soft mt-1">
          Explore how Quran ayat connect around one value.
        </p>
      </header>

      {error && (
        <div className="text-sm text-accent-pink bg-accent-pink/10 border-2 border-accent-pink/30 rounded-2xl p-3 mb-4">
          {error}
        </div>
      )}

      {missions === null && !error && (
        <div className="text-ink-soft text-sm">Loading…</div>
      )}

      <ul className="flex flex-col gap-3">
        {missions?.map((m) => (
          <MissionCard key={m.id} mission={m} completedSet={completedSet} />
        ))}
        {missions?.length === 0 && (
          <div className="text-ink-soft text-sm text-center py-12">
            No compass missions yet.
          </div>
        )}
      </ul>
    </div>
  );
}

function MissionCard({ mission: m, completedSet }) {
  // A mission is "started" when at least one of its quest IDs is completed.
  // We don't have individual quest IDs here, so we use the compass lens
  // structure if available, else just show an open state.
  return (
    <li>
      <Link
        to={`/compass/${m.id}`}
        className="block bg-white border-2 border-gray-100 rounded-3xl p-4 shadow-card hover:border-brand-300 hover:scale-[1.005] transition"
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl shrink-0">
            {m.emoji || '🧭'}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="font-extrabold text-ink leading-tight">{m.title}</div>

            {/* Child-friendly goal line */}
            {m.subtitle && (
              <div className="text-xs text-ink-faint font-semibold mt-0.5">{m.subtitle}</div>
            )}

            {/* Description / theme goal */}
            {m.description && (
              <p className="text-sm text-ink-soft mt-1.5 line-clamp-2">{m.description}</p>
            )}

            {/* Quran reference if available */}
            {m.primaryVerse && (
              <div className="mt-2 text-[10px] text-ink-faint font-semibold uppercase tracking-wide">
                Quran {m.primaryVerse}
              </div>
            )}

            {/* Lenses / quest path indicator */}
            <div className="flex items-center gap-3 mt-2.5 text-xs font-bold text-ink-soft">
              <span>🧭 {m.lensCount} lenses</span>
              {m.xp && <span>⭐ +{m.xp} XP</span>}
            </div>
          </div>

          {/* Arrow */}
          <span className="text-ink-faint text-lg self-center shrink-0">›</span>
        </div>
      </Link>
    </li>
  );
}
