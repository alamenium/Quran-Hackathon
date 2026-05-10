import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useProgress } from '../context/ProgressContext.jsx';
import { Character } from '../components/Character.jsx';
import { SpeechBubble } from '../components/SpeechBubble.jsx';

// Home: shows the section/unit/quest roadmap, plus a Daily Quest button.
export default function HomePage() {
  const { user } = useProgress();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [daily, setDaily] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [r, d] = await Promise.all([api.roadmap(), api.daily()]);
        if (mounted) {
          setRoadmap(r);
          setDaily(d);
        }
      } catch (err) {
        if (mounted) setError(err.message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // First-time users go to onboarding (character pick → diagnostic).
  useEffect(() => {
    if (user && !user.placement) {
      navigate('/welcome', { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;
  if (error) return <ErrorScreen error={error} />;
  if (!roadmap) return <LoadingScreen />;

  const completedSet = new Set(
    user.completedQuests.map((q) => q.questId)
  );

  return (
    <div className="px-4 py-4 pb-32 max-w-screen-md mx-auto flex flex-col gap-6">
      {/* Daily quest banner */}
      {daily && (
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-3xl p-5 text-white shadow-card">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 rounded-2xl p-2">
              <span className="text-3xl" aria-hidden>
                ⚡
              </span>
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase font-extrabold opacity-90 tracking-wide">
                Daily Quest
              </div>
              <div className="text-lg font-extrabold mb-1">
                {daily.quest.title}
              </div>
              <div className="text-sm opacity-90 mb-3">
                {daily.quest.questions.length} short questions · {daily.quest.xp} XP
              </div>
              <button
                type="button"
                onClick={() => navigate(`/quest/${daily.quest.id}`)}
                className="duo-btn"
                style={{ background: 'white', color: '#46a302' }}
              >
                Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sections */}
      {roadmap.sections.map((section) => (
        <SectionBlock
          key={section.id}
          section={section}
          completedSet={completedSet}
          activeQuestId={firstIncompleteQuest(section, completedSet)}
        />
      ))}

      {/* Mistake review nudge */}
      {user.mistakes.length > 0 && (
        <Link
          to="/toolkit"
          className="bg-accent-orange/10 border-2 border-accent-orange rounded-2xl p-4 flex items-center gap-3"
        >
          <span className="text-3xl" aria-hidden>
            🩹
          </span>
          <div className="flex-1">
            <div className="font-extrabold text-ink">
              {user.mistakes.length}{' '}
              {user.mistakes.length === 1 ? 'mistake' : 'mistakes'} to review
            </div>
            <div className="text-xs text-ink-soft">
              Let's fix them together — gently.
            </div>
          </div>
          <span className="text-accent-orange font-extrabold">→</span>
        </Link>
      )}
    </div>
  );
}

function SectionBlock({ section, completedSet, activeQuestId }) {
  return (
    <section>
      <div
        className="rounded-3xl px-4 py-3 mb-4 text-white"
        style={{ background: section.color }}
      >
        <div className="text-xs uppercase font-extrabold opacity-90 tracking-wide">
          Section {section.order}
        </div>
        <div className="text-xl font-extrabold">{section.title}</div>
        {section.subtitle && (
          <div className="text-sm opacity-90">{section.subtitle}</div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {section.units.map((unit) => (
          <UnitBlock
            key={unit.id}
            unit={unit}
            color={section.color}
            completedSet={completedSet}
            activeQuestId={activeQuestId}
          />
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
          className="w-6 h-6 rounded-full text-xs flex items-center justify-center text-white font-extrabold"
          style={{ background: color }}
        >
          {unit.order}
        </span>
        <div className="font-extrabold text-ink">{unit.title}</div>
      </div>

      {/* Snake roadmap layout */}
      <div className="flex flex-col items-center gap-4 py-2">
        {unit.quests.map((quest, idx) => {
          const completed = completedSet.has(quest.id);
          const active = quest.id === activeQuestId;
          const locked = !completed && !active;
          // Stagger left/right like a Duolingo snake path
          const offset = idx % 4;
          const align =
            offset === 0
              ? 'self-center'
              : offset === 1
              ? 'self-end mr-8'
              : offset === 2
              ? 'self-center'
              : 'self-start ml-8';

          return (
            <div key={quest.id} className={`relative ${align}`}>
              {!locked ? (
                <Link
                  to={`/quest/${quest.id}`}
                  className={`roadmap-node ${completed ? 'complete' : 'active'}`}
                  style={completed ? {} : { background: color }}
                  aria-label={quest.title}
                >
                  {completed ? '✓' : '★'}
                </Link>
              ) : (
                <div
                  className="roadmap-node locked"
                  aria-label={`${quest.title} (locked)`}
                  title="Complete the previous quest to unlock"
                >
                  🔒
                </div>
              )}
              <div className="text-center text-xs font-bold text-ink mt-2 max-w-[150px] mx-auto">
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

function firstIncompleteQuest(section, completedSet) {
  for (const u of section.units) {
    for (const q of u.quests) {
      if (!completedSet.has(q.id)) return q.id;
    }
  }
  return null;
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Character emotion="think" size={140} />
      <SpeechBubble>
        <span className="text-sm">Loading your quests…</span>
      </SpeechBubble>
    </div>
  );
}

function ErrorScreen({ error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 gap-3">
      <Character emotion="scared" size={140} />
      <div className="font-bold text-ink-soft text-center">{error}</div>
      <button onClick={() => location.reload()} className="duo-btn-primary">
        Try again
      </button>
    </div>
  );
}
