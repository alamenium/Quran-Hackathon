import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Character } from '../components/Character.jsx';
import { characterImage } from '../lib/characters.js';
import { useProgress } from '../context/ProgressContext.jsx';

export default function LibraryPage() {
  const { user } = useProgress();
  const [stories, setStories] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.stories().then((d) => setStories(d.stories)).catch((err) => setError(err.message));
  }, []);

  return (
    <div className="px-4 py-4 pb-32 max-w-screen-md mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Character emotion="surprise" size={80} />
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Storybook Library</h1>
          <p className="text-sm text-ink-soft">
            Real Quran stories with read-to-me & activities.
          </p>
        </div>
      </div>

      {error && <div className="text-accent-pink">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stories?.map((s) => (
          <Link
            key={s.id}
            to={`/library/${s.id}`}
            className="bg-white rounded-3xl border-2 border-gray-100 shadow-card p-4 flex gap-3 items-center hover:border-brand-500 transition"
          >
            <img
              src={characterImage(user?.character || 'boy1', s.cover_emotion)}
              alt=""
              className="w-20 h-20 object-contain shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase font-extrabold text-ink-soft">
                {s.surah_reference}
              </div>
              <div className="font-extrabold text-ink truncate">{s.title}</div>
              <div className="text-xs text-ink-soft line-clamp-2">{s.summary}</div>
              <div className="text-[10px] text-ink-faint mt-1">
                {s.pageCount} pages
              </div>
            </div>
          </Link>
        ))}
        {stories && stories.length === 0 && (
          <div className="text-ink-soft">No stories yet.</div>
        )}
      </div>
    </div>
  );
}
