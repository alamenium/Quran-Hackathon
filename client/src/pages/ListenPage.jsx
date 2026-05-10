import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { VerseCard } from '../components/VerseCard.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { Character } from '../components/Character.jsx';

const FEATURED_SURAHS = [1, 103, 108, 112, 113, 114];

export default function ListenPage() {
  const { user, toggleBookmark } = useProgress();
  const [surahId, setSurahId] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showTafsir, setShowTafsir] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);

  useEffect(() => {
    let mounted = true;
    setData(null);
    api
      .surah(surahId)
      .then((d) => mounted && setData(d))
      .catch((err) => mounted && setError(err.message));
    return () => {
      mounted = false;
    };
  }, [surahId]);

  return (
    <div className="px-4 py-4 pb-32 max-w-screen-md mx-auto">
      <div className="flex items-center gap-3 mb-3">
        <Character emotion="quran_reading" size={80} />
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Listen & Follow</h1>
          <p className="text-sm text-ink-soft">
            Tap a surah, listen along, follow the words.
          </p>
        </div>
      </div>

      {/* Surah picker chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 mb-4">
        {FEATURED_SURAHS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setSurahId(id)}
            className={`shrink-0 px-4 py-2 rounded-full font-bold border-2 transition ${
              surahId === id
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white text-ink border-gray-200'
            }`}
          >
            {id}
          </button>
        ))}
      </div>

      {/* Display options */}
      <div className="flex gap-2 mb-4 text-xs">
        <Toggle
          label="Translation"
          active={showTranslation}
          onClick={() => setShowTranslation((v) => !v)}
        />
        <Toggle
          label="Simple meaning"
          active={showTafsir}
          onClick={() => setShowTafsir((v) => !v)}
        />
      </div>

      {error && <div className="text-accent-pink">{error}</div>}
      {data && (
        <>
          <div className="mb-4">
            <div className="text-xs uppercase font-extrabold text-ink-soft tracking-wide">
              Surah {data.surah.id}
            </div>
            <div className="text-2xl font-extrabold text-ink">
              {data.surah.name_simple}{' '}
              <span className="text-ink-soft">— {data.surah.name_english}</span>
            </div>
            <div className="font-arabic text-3xl text-ink mt-1">
              {data.surah.name_arabic}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {data.verses.map((v) => {
              const bookmarked = user?.bookmarks?.includes(v.verse_key);
              return (
                <div key={v.verse_key} className="relative">
                  <VerseCard
                    verse={v}
                    showTafsir={showTafsir}
                    showTranslation={showTranslation}
                  />
                  <button
                    type="button"
                    onClick={() => toggleBookmark(v.verse_key)}
                    className={`absolute top-3 right-3 text-2xl ${
                      bookmarked ? 'text-accent-orange' : 'text-ink-faint'
                    }`}
                    aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                  >
                    {bookmarked ? '★' : '☆'}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Toggle({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full font-bold border-2 ${
        active
          ? 'bg-brand-500/10 text-brand-500 border-brand-500'
          : 'bg-white text-ink-soft border-gray-200'
      }`}
    >
      {active ? '✓ ' : ''}
      {label}
    </button>
  );
}
