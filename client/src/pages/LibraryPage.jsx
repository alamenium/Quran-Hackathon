import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

// Theme → icon + color mapping. Avoids repeating the same character image
// on every card which made the library feel visually monotonous.
const THEME_META = {
  gratitude: { icon: '🌻', bg: 'bg-amber-50', border: 'border-amber-200', tag: 'text-amber-700 bg-amber-100' },
  patience:  { icon: '🌊', bg: 'bg-sky-50',   border: 'border-sky-200',   tag: 'text-sky-700 bg-sky-100' },
  kindness:  { icon: '🤲', bg: 'bg-pink-50',  border: 'border-pink-200',  tag: 'text-pink-700 bg-pink-100' },
  creation:  { icon: '🌿', bg: 'bg-green-50', border: 'border-green-200', tag: 'text-green-700 bg-green-100' },
  mercy:     { icon: '💚', bg: 'bg-green-50', border: 'border-green-200', tag: 'text-green-700 bg-green-100' },
};
function themeMeta(theme) {
  return THEME_META[theme] || { icon: '📖', bg: 'bg-paper', border: 'border-gray-200', tag: 'text-ink-soft bg-gray-100' };
}

export default function LibraryPage() {
  const [stories, setStories] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.stories()
      .then((d) => setStories(d.stories))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="px-4 pt-5 pb-28 max-w-screen-md mx-auto">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink">Story Library</h1>
        <p className="text-sm text-ink-soft mt-1">
          Real Quran stories with read-to-me &amp; activities.
        </p>
      </header>

      {error && (
        <div className="text-sm text-accent-pink bg-accent-pink/10 border-2 border-accent-pink/30 rounded-2xl p-3 mb-4">
          {error}
        </div>
      )}

      {!stories && !error && (
        <div className="text-ink-soft text-sm">Loading stories…</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stories?.map((s) => <StoryCard key={s.id} story={s} />)}
        {stories?.length === 0 && (
          <div className="text-ink-soft text-sm col-span-2 text-center py-12">No stories yet.</div>
        )}
      </div>
    </div>
  );
}

function StoryCard({ story: s }) {
  const tm = themeMeta(s.theme);
  return (
    <Link
      to={`/library/${s.id}`}
      className={`flex flex-col ${tm.bg} border-2 ${tm.border} rounded-3xl p-4 shadow-card hover:scale-[1.01] transition min-h-[9rem]`}
    >
      {/* Top row: icon + title + reference */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-2xl shrink-0 shadow-sm">
          {tm.icon}
        </div>
        <div className="flex-1 min-w-0">
          {s.surah_reference && (
            <div className="text-[10px] text-ink-faint font-semibold mb-0.5 uppercase tracking-wide">
              Quran {s.surah_reference}
            </div>
          )}
          <div className="font-extrabold text-ink leading-tight">{s.title}</div>
        </div>
      </div>

      {/* Summary */}
      {s.summary && (
        <p className="text-xs text-ink-soft mt-2 line-clamp-2">{s.summary}</p>
      )}

      {/* Footer: theme tag + page count + CTA */}
      <div className="flex items-center justify-between mt-auto pt-3">
        <div className="flex items-center gap-2 flex-wrap">
          {s.theme && (
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide ${tm.tag}`}>
              {s.theme}
            </span>
          )}
          {s.pageCount && (
            <span className="text-[10px] text-ink-faint">{s.pageCount} pages</span>
          )}
        </div>
        <span className="text-xs font-extrabold text-brand-500">Read story →</span>
      </div>
    </Link>
  );
}
