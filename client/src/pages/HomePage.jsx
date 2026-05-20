import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useProgress } from '../context/ProgressContext.jsx';
import { Character } from '../components/Character.jsx';
import { SpeechBubble } from '../components/SpeechBubble.jsx';
import { SectionCompass } from '../components/SectionCompass.jsx';
import { sfx } from '../lib/sfx.js';
import { GuessProphetGame } from '../components/GuessProphetGame.jsx';

// Learn page — primary action is Today's Quest.
// Secondary: Continue Learning (section roadmap), Stories preview.
// No floating Listen button; no random quick-link grid.

function unlockedLensIds(section, completedSet) {
  const ids = [];
  for (const unit of section.units || []) {
    for (const quest of unit.quests || []) {
      if (quest.compass_lens && completedSet.has(quest.id)) {
        ids.push(quest.compass_lens);
      }
    }
  }
  return ids;
}

function firstIncompleteQuest(section, completedSet) {
  for (const u of section.units) {
    for (const q of u.quests) {
      if (!completedSet.has(q.id)) return q.id;
    }
  }
  return null;
}

export default function HomePage() {
  const { user } = useProgress();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [daily, setDaily] = useState(null);
  const [stories, setStories] = useState(null);
  const [error, setError] = useState(null);
  const [gameOpen, setGameOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.roadmap(),
      api.daily(),
      api.stories().catch(() => ({ stories: [] })),
    ])
      .then(([r, d, s]) => {
        if (!mounted) return;
        setRoadmap(r);
        setDaily(d);
        setStories(s.stories || []);
      })
      .catch((err) => mounted && setError(err.message));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (user && !user.placement) navigate('/welcome', { replace: true });
  }, [user, navigate]);

  if (!user) return null;
  if (error) return <ErrorScreen error={error} />;
  if (!roadmap) return <LoadingScreen />;

  const completedSet = new Set(user.completedQuests.map((q) => q.questId));
  const previewStories = (stories || []).slice(0, 2);

  return (
    <div className="px-4 py-5 pb-28 max-w-screen-md mx-auto flex flex-col gap-5">

      {/* ── Today's Quest ─────────────────────────────────────── */}
      {daily && (
        <div
          className="rounded-3xl p-5 text-white shadow-card"
          style={{ background: 'linear-gradient(135deg, #58CC02 0%, #46a302 100%)' }}
        >
          <div className="text-[10px] uppercase font-extrabold opacity-80 tracking-widest mb-1">
            Today's Quest
          </div>
          <div className="text-xl font-extrabold leading-tight mb-0.5">
            {daily.quest.title}
          </div>
          <div className="text-sm opacity-80 mb-4">
            {daily.quest.questions.length} steps · {daily.quest.xp} XP
          </div>
          <button
            type="button"
            onClick={() => { sfx.click(); navigate(`/quest/${daily.quest.id}`); }}
            className="w-full py-3 rounded-2xl font-extrabold text-brand-600 bg-white text-sm tracking-wide shadow-duo transition hover:opacity-90"
          >
            Start Quest →
          </button>
        </div>
      )}

      {/* ── Continue Learning ─────────────────────────────────── */}
      <section>
        <SectionHeader label="Continue Learning" />
        <div className="flex flex-col gap-4">
          {roadmap.sections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              completedSet={completedSet}
              activeQuestId={firstIncompleteQuest(section, completedSet)}
            />
          ))}
        </div>
      </section>

      {/* ── Guess the Prophet — mini-game ─────────────────────── */}
      <section>
        <SectionHeader label="Mini Game" />
        {!gameOpen ? (
          <button
            type="button"
            onClick={() => { sfx.click(); setGameOpen(true); }}
            className="w-full bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-3xl p-4 text-left hover:scale-[1.005] transition flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-white border border-amber-200 flex items-center justify-center text-3xl shrink-0 shadow-sm">
              🌟
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-ink text-sm leading-tight">
                Guess the Prophet
              </div>
              <div className="text-[11px] text-amber-700 font-bold mt-0.5" dir="rtl">
                من هو النبي؟
              </div>
              <p className="text-xs text-ink-soft mt-1">
                Use Quran clues to guess which Prophet's story you're hearing.
              </p>
              <div className="text-[10px] text-ink-faint mt-1">
                6 short rounds · ayahs from Quran Foundation
              </div>
            </div>
            <span className="text-amber-700 font-extrabold shrink-0">→</span>
          </button>
        ) : (
          <div className="relative">
            <GuessProphetGame embedded onClose={() => setGameOpen(false)} />
            <button
              type="button"
              onClick={() => { sfx.click(); setGameOpen(false); }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-ink-soft hover:bg-paper transition"
              aria-label="Close game"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}
      </section>

      {/* ── Quran Stories preview ─────────────────────────────── */}
      {previewStories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <SectionHeader label="Quran Stories" />
            <Link to="/library" className="text-xs font-extrabold text-brand-500">
              View all →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {previewStories.map((s) => (
              <StoryPreviewCard key={s.id} story={s} />
            ))}
          </div>
        </section>
      )}

      {/* ── Mistake review nudge ──────────────────────────────── */}
      {user.mistakes.length > 0 && (
        <Link
          to="/toolkit"
          className="bg-accent-orange/10 border-2 border-accent-orange/40 rounded-2xl p-4 flex items-center gap-3"
        >
          <span className="text-2xl" aria-hidden>🩹</span>
          <div className="flex-1">
            <div className="font-extrabold text-ink text-sm">
              {user.mistakes.length} {user.mistakes.length === 1 ? 'mistake' : 'mistakes'} to review
            </div>
            <div className="text-xs text-ink-soft">Tap to go over them gently.</div>
          </div>
          <span className="text-accent-orange font-extrabold text-lg">→</span>
        </Link>
      )}
    </div>
  );
}

// ── Section header label ──────────────────────────────────────────────────
function SectionHeader({ label }) {
  return (
    <h2 className="text-xs uppercase font-extrabold text-ink-soft tracking-widest mb-3 px-0.5">
      {label}
    </h2>
  );
}

// ── Story preview card ────────────────────────────────────────────────────
const THEME_COLORS = {
  gratitude: { bg: 'bg-amber-50', border: 'border-amber-200', tag: 'text-amber-700 bg-amber-100' },
  patience:  { bg: 'bg-blue-50',  border: 'border-blue-200',  tag: 'text-blue-700 bg-blue-100' },
  kindness:  { bg: 'bg-pink-50',  border: 'border-pink-200',  tag: 'text-pink-700 bg-pink-100' },
};
function themeColor(theme) {
  return THEME_COLORS[theme] || { bg: 'bg-green-50', border: 'border-green-200', tag: 'text-green-700 bg-green-100' };
}

function StoryPreviewCard({ story }) {
  const tc = themeColor(story.theme);
  return (
    <Link
      to={`/library/${story.id}`}
      className={`flex items-center gap-4 ${tc.bg} border-2 ${tc.border} rounded-2xl p-4 hover:scale-[1.01] transition`}
    >
      {/* Themed icon instead of repetitive character image */}
      <div className="w-14 h-14 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-3xl shrink-0 shadow-sm">
        {story.theme === 'gratitude' ? '🌻' : story.theme === 'patience' ? '🌊' : '📖'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-extrabold text-ink text-sm leading-tight truncate">
          {story.title}
        </div>
        {story.surah_reference && (
          <div className="text-[10px] text-ink-faint font-semibold mt-0.5">
            Quran {story.surah_reference}
          </div>
        )}
        <div className="text-xs text-ink-soft mt-1 line-clamp-1">{story.summary}</div>
        <div className="flex items-center gap-2 mt-2">
          {story.theme && (
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide ${tc.tag}`}>
              {story.theme}
            </span>
          )}
          {story.pageCount && (
            <span className="text-[10px] text-ink-faint">{story.pageCount} pages</span>
          )}
        </div>
      </div>
      <span className="text-ink-faint text-lg shrink-0">›</span>
    </Link>
  );
}

// ── Section / unit blocks ─────────────────────────────────────────────────
function SectionBlock({ section, completedSet, activeQuestId }) {
  if (section.theme === 'gratitude' && section.compass) {
    return (
      <section>
        <GratitudeGardenHero section={section} completedSet={completedSet} />
        <div className="flex flex-col gap-5">
          {section.units.map((unit) => (
            <UnitBlock key={unit.id} unit={unit} color={section.color} completedSet={completedSet} activeQuestId={activeQuestId} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div
        className="rounded-2xl px-4 py-3 mb-4 text-white"
        style={{ background: section.color || '#58CC02' }}
      >
        <div className="text-[10px] uppercase font-extrabold opacity-80 tracking-widest">
          {section.title}
        </div>
        {section.subtitle && (
          <div className="text-xs opacity-80 mt-0.5">{section.subtitle}</div>
        )}
      </div>
      <div className="flex flex-col gap-5">
        {section.units.map((unit) => (
          <UnitBlock key={unit.id} unit={unit} color={section.color} completedSet={completedSet} activeQuestId={activeQuestId} />
        ))}
      </div>
    </section>
  );
}

function UnitBlock({ unit, color, completedSet, activeQuestId }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 px-1">
        <span
          className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white font-extrabold shrink-0"
          style={{ background: color || '#58CC02' }}
        >
          {unit.order}
        </span>
        <div className="font-extrabold text-sm text-ink">{unit.title}</div>
      </div>

      {/* Compact quest path — snake layout, smaller nodes */}
      <div className="flex flex-col items-center gap-3 py-1">
        {unit.quests.map((quest, idx) => {
          const completed = completedSet.has(quest.id);
          const active = quest.id === activeQuestId;
          const locked = !completed && !active;
          const offset = idx % 4;
          const align =
            offset === 0 ? 'self-center'
            : offset === 1 ? 'self-end mr-6'
            : offset === 2 ? 'self-center'
            : 'self-start ml-6';
          return (
            <div key={quest.id} className={`relative ${align}`}>
              {!locked ? (
                <Link
                  to={`/quest/${quest.id}`}
                  className={`roadmap-node ${completed ? 'complete' : 'active'}`}
                  style={completed ? {} : { background: color || '#58CC02' }}
                  aria-label={quest.title}
                >
                  {completed ? '✓' : '★'}
                </Link>
              ) : (
                <div className="roadmap-node locked" aria-label={`${quest.title} (locked)`}>
                  🔒
                </div>
              )}
              <div className="text-center text-xs font-bold text-ink mt-1.5 max-w-[130px] mx-auto leading-tight">
                {quest.title}
              </div>
              <div className="text-center text-[10px] text-ink-faint">
                {quest.questionCount} q · {quest.xp} XP
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Gratitude Garden hero ─────────────────────────────────────────────────
function GratitudeGardenHero({ section, completedSet }) {
  const compass = section.compass || {};
  const lenses = compass.lenses || [];
  const unlockedIds = unlockedLensIds(section, completedSet);
  const done = unlockedIds.length;
  const total = lenses.length;
  return (
    <div
      className="rounded-3xl px-4 py-4 mb-4 shadow-card border-2"
      style={{
        background: 'linear-gradient(135deg, #FFF8E7 0%, #FFD6A5 55%, #B8EBD0 100%)',
        borderColor: '#F9C74F',
        color: '#40516A',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase font-extrabold tracking-widest opacity-80">
            Section {section.order} · Gratitude Garden 🌻
          </div>
          <div className="text-xl font-extrabold mt-0.5">{section.title}</div>
          {section.subtitle && <div className="text-sm opacity-80 mt-1">{section.subtitle}</div>}
          {compass.missionTitle && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-full" style={{ background: '#FFFFFFAA', color: '#8A6A44' }}>
              🧭 Mission · {compass.missionTitle}
            </div>
          )}
          <div className="mt-2 text-xs font-bold opacity-80">{done}/{total} lenses lit</div>
        </div>
        <div className="shrink-0">
          <SectionCompass lenses={lenses} unlockedIds={unlockedIds} size={110} />
        </div>
      </div>
    </div>
  );
}

// ── Utility screens ───────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Character emotion="think" size={120} />
      <SpeechBubble><span className="text-sm">Loading your quests…</span></SpeechBubble>
    </div>
  );
}

function ErrorScreen({ error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 gap-3">
      <Character emotion="scared" size={120} />
      <div className="font-bold text-ink-soft text-center text-sm">{error}</div>
      <button onClick={() => location.reload()} className="duo-btn-primary">Try again</button>
    </div>
  );
}
