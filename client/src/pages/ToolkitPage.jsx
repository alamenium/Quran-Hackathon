import { useEffect, useState } from 'react';
import { useProgress } from '../context/ProgressContext.jsx';
import { api } from '../lib/api.js';
import { Character } from '../components/Character.jsx';
import { VerseCard } from '../components/VerseCard.jsx';
import { AudioButton } from '../components/AudioButton.jsx';

const TABS = [
  { id: 'compass', label: 'Compass cards', icon: '🧭' },
  { id: 'mistakes', label: 'Mistakes', icon: '🩹' },
  { id: 'words', label: 'Words', icon: '📚' },
  { id: 'bookmarks', label: 'Bookmarks', icon: '⭐' },
  { id: 'reflections', label: 'Reflections', icon: '🪞' },
];

// Read Compass cards saved to localStorage by CompassMissionPage.
function loadCompassCards() {
  try {
    return JSON.parse(localStorage.getItem('aq_compass_cards') || '[]');
  } catch {
    return [];
  }
}

export default function ToolkitPage() {
  const { user, toggleSavedWord, toggleBookmark, clearMistake } = useProgress();
  const [tab, setTab] = useState('compass');
  const [allWords, setAllWords] = useState([]);
  const [bookmarkVerses, setBookmarkVerses] = useState({});
  const [compassCards, setCompassCards] = useState(() => loadCompassCards());

  useEffect(() => {
    api.words().then((d) => setAllWords(d.words));
  }, []);

  // Hydrate bookmark verse text on demand.
  useEffect(() => {
    if (!user) return;
    user.bookmarks.forEach((vk) => {
      if (!bookmarkVerses[vk]) {
        api.verse(vk).then((d) => {
          setBookmarkVerses((m) => ({ ...m, [vk]: d.verse }));
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.bookmarks]);

  if (!user) return null;

  const savedWords = allWords.filter((w) => user.savedWords.includes(w.id));

  return (
    <div className="px-4 py-4 pb-32 max-w-screen-md mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Character emotion="quran_reading" size={80} />
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Toolkit</h1>
          <p className="text-sm text-ink-soft">
            Your Quran learning notebook.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 my-4">
        <Stat icon="🔥" label="Streak" value={user.streak.current} />
        <Stat icon="⭐" label="XP" value={user.xp} />
        <Stat icon="🏅" label="Badges" value={user.badges.length} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
        {TABS.map((t) => {
          const count =
            t.id === 'compass'
              ? compassCards.length
              : t.id === 'mistakes'
              ? user.mistakes.length
              : t.id === 'words'
              ? user.savedWords.length
              : t.id === 'bookmarks'
              ? user.bookmarks.length
              : user.reflections.length;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-3 py-2 rounded-full font-bold border-2 ${
                tab === t.id
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-ink border-gray-200'
              }`}
            >
              {t.icon} {t.label}
              {count > 0 && <span className="ml-1 opacity-80">({count})</span>}
            </button>
          );
        })}
      </div>

      {tab === 'compass' && (
        <div className="flex flex-col gap-3">
          {compassCards.length === 0 && (
            <Empty
              text="Finish a Quran Compass mission to save its card here."
              emotion="think"
            />
          )}
          {compassCards.map((entry) => (
            <CompassCardView
              key={entry.missionId}
              entry={entry}
              onDelete={() => {
                const next = compassCards.filter((c) => c.missionId !== entry.missionId);
                setCompassCards(next);
                try {
                  localStorage.setItem('aq_compass_cards', JSON.stringify(next));
                } catch {}
              }}
            />
          ))}
        </div>
      )}

      {tab === 'mistakes' && (
        <div className="flex flex-col gap-3">
          {user.mistakes.length === 0 && (
            <Empty
              text="No mistakes to fix — great work!"
              emotion="happy"
            />
          )}
          {user.mistakes.map((m, i) => (
            <div
              key={m.ts + '_' + i}
              className="bg-white border-2 border-accent-orange/40 rounded-2xl p-4"
            >
              <div className="text-xs font-extrabold uppercase text-accent-orange mb-1">
                Mistake
              </div>
              <div className="font-bold text-ink mb-1">{m.prompt}</div>
              <div className="text-sm text-ink-soft mb-1">
                <span className="font-bold text-accent-pink">You said:</span>{' '}
                {m.mistakeAnswer || '—'}
              </div>
              <div className="text-sm text-ink-soft mb-3">
                <span className="font-bold text-brand-500">Right answer:</span>{' '}
                {m.correctAnswer || '—'}
              </div>
              <button
                type="button"
                onClick={() => clearMistake(m.questionId, m.ts)}
                className="duo-btn-ghost w-full"
              >
                Got it now ✓
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'words' && (
        <div className="flex flex-col gap-3">
          {savedWords.length === 0 && (
            <Empty text="Save words from quests to remember them here." emotion="think" />
          )}
          {savedWords.map((w) => (
            <WordRow key={w.id} word={w} onRemove={() => toggleSavedWord(w.id)} />
          ))}

          <div className="text-xs uppercase font-extrabold text-ink-faint mt-4">
            Add from the dictionary
          </div>
          <div className="grid grid-cols-1 gap-2">
            {allWords
              .filter((w) => !user.savedWords.includes(w.id))
              .slice(0, 8)
              .map((w) => (
                <WordRow key={w.id} word={w} onAdd={() => toggleSavedWord(w.id)} />
              ))}
          </div>
        </div>
      )}

      {tab === 'bookmarks' && (
        <div className="flex flex-col gap-3">
          {user.bookmarks.length === 0 && (
            <Empty text="Bookmark verses on the Listen page to see them here." emotion="surprise" />
          )}
          {user.bookmarks.map((vk) => (
            <div key={vk} className="relative">
              {bookmarkVerses[vk] ? (
                <VerseCard verse={bookmarkVerses[vk]} compact />
              ) : (
                <div className="bg-cream border-2 border-accent-gold/40 rounded-3xl p-4 animate-pulse text-ink-soft">
                  Loading {vk}…
                </div>
              )}
              <button
                type="button"
                onClick={() => toggleBookmark(vk)}
                className="absolute top-3 right-3 text-2xl text-accent-orange"
                aria-label="Remove bookmark"
              >
                ★
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'reflections' && (
        <div className="flex flex-col gap-3">
          {user.reflections.length === 0 && (
            <Empty text="Your reflections from quests will live here, privately." emotion="think" />
          )}
          {user.reflections.map((r, i) => (
            <div key={i} className="bg-white border-2 border-accent-purple/30 rounded-2xl p-4">
              <div className="text-xs font-extrabold uppercase text-accent-purple mb-1">
                Reflection
              </div>
              <div className="text-sm text-ink-soft italic mb-2">
                {r.prompt}
              </div>
              {r.text ? (
                <div className="text-ink">{r.text}</div>
              ) : (
                <div className="text-ink-faint text-sm">(saved without text)</div>
              )}
              <div className="text-[10px] text-ink-faint mt-2">
                {new Date(r.ts).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Badges */}
      {user.badges.length > 0 && (
        <div className="mt-6">
          <div className="text-xs uppercase font-extrabold text-ink-faint mb-2">
            Badges
          </div>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((b) => (
              <span
                key={b}
                className="bg-accent-gold/20 border-2 border-accent-gold/50 text-accent-orange px-3 py-1 rounded-full font-bold text-sm"
              >
                🏅 {b.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl p-3 text-center">
      <div className="text-2xl">{icon}</div>
      <div className="text-xl font-extrabold text-ink">{value}</div>
      <div className="text-xs text-ink-soft">{label}</div>
    </div>
  );
}

function Empty({ text, emotion = 'think' }) {
  return (
    <div className="bg-paper border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center flex flex-col items-center gap-3">
      <Character emotion={emotion} size={120} />
      <div className="text-ink-soft text-sm font-bold">{text}</div>
    </div>
  );
}

function WordRow({ word, onAdd, onRemove }) {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl p-3 flex items-center gap-3">
      <div className="flex-1">
        <div className="font-arabic text-2xl text-ink">{word.arabic}</div>
        <div className="text-xs text-ink-soft">
          {word.transliteration} — {word.meaning}
        </div>
      </div>
      {word.verses?.[0] && (
        <AudioButtonInline verseKey={word.verses[0]} />
      )}
      {onAdd ? (
        <button onClick={onAdd} className="duo-btn-ghost text-sm">
          + Save
        </button>
      ) : (
        <button onClick={onRemove} className="duo-btn-ghost text-sm">
          Remove
        </button>
      )}
    </div>
  );
}

function CompassCardView({ entry, onDelete }) {
  const card = entry.card || {};
  return (
    <div className="bg-gradient-to-br from-cream to-paper border-2 border-accent-gold rounded-3xl p-5 shadow-card">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-base font-extrabold text-ink">
          <span className="mr-2" aria-hidden>{entry.emoji || '🧭'}</span>
          {card.title || entry.missionTitle}
        </h3>
        <button
          type="button"
          onClick={onDelete}
          className="text-xs text-ink-faint hover:text-accent-pink underline"
        >
          remove
        </button>
      </div>
      {Array.isArray(card.lines) && (
        <ol className="space-y-1.5 text-ink leading-relaxed text-sm">
          {card.lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      )}
      {card.ayah && (
        <div className="mt-3 border-t border-accent-gold/40 pt-3 text-right">
          <div className="font-arabic text-xl text-ink leading-loose" dir="rtl">
            {card.ayah}
          </div>
          {card.ayahEn && (
            <div className="text-xs text-ink-soft mt-1 text-left italic">
              "{card.ayahEn}"
            </div>
          )}
          {card.ayahRef && (
            <div className="text-[10px] font-bold text-ink-faint mt-1 text-left">
              {card.ayahRef}
            </div>
          )}
        </div>
      )}
      <div className="text-[10px] text-ink-faint mt-2">
        Saved {new Date(entry.savedAt).toLocaleDateString()}
      </div>
    </div>
  );
}

function AudioButtonInline({ verseKey }) {
  const [verse, setVerse] = useState(null);
  useEffect(() => {
    api.verse(verseKey).then((d) => setVerse(d.verse)).catch(() => {});
  }, [verseKey]);
  if (!verse) return null;
  return <AudioButton src={verse.audio_url} label="" />;
}
