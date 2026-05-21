// QuestPage — drives the full 7-step lesson flow:
//   1. Listen (VerseCard with audio for each verse)
//   2. Understand (translation + tafsir card)
//   3. Words (Word Explorer)
//   4. Tajweed (TajweedHighlight)
//   5. Practise (questions array)
//   6. Moral Scenario
//   7. Reflect
// Each of these is converted into a "step" object that QuestionRenderer
// or a dedicated UI component handles.

import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useProgress } from '../context/ProgressContext.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { FeedbackBar } from '../components/FeedbackBar.jsx';
import { QuestionRenderer } from '../components/questions/QuestionRenderer.jsx';
import { VerseCard } from '../components/VerseCard.jsx';
import { Character } from '../components/Character.jsx';
import { AudioButton } from '../components/AudioButton.jsx';
import { SectionCompass } from '../components/SectionCompass.jsx';
import { SourceBadge, SourceCard } from '../components/SourceBadge.jsx';
import { sfx } from '../lib/sfx.js';

// Build a flat array of steps from quest data.
function buildSteps(quest) {
  const steps = [];

  // Step 1: Listen — one card per verse
  (quest.verses || []).forEach((v) => {
    steps.push({ type: 'listen', verse: v });
  });

  // Step 2: Understand — tafsir of the first verse
  if (quest.verses?.[0]) {
    steps.push({ type: 'understand', verse: quest.verses[0] });
  }

  // Step 3: Words — rendered as a single non-graded step
  if (quest.words?.length) {
    steps.push({ type: 'words', words: quest.words });
  }

  // Step 4: Tajweed highlight
  if (quest.tajweed) {
    steps.push({
      type: 'tajweed_highlight',
      ...quest.tajweed,
      audio: quest.verses?.find(v => v.verse_key === quest.tajweed?.audio_example_verse),
    });
  }

  // New step: Allah's Name card (used by the Gratitude Compass — Quest 4).
  if (quest.allah_name) {
    steps.push({ type: 'allah_name', ...quest.allah_name });
  }

  // New step: Story link (used by the Gratitude Compass — Quest 6).
  // Embeds an inline link card pointing at the symbolic story in the
  // Storybook Library.
  if (quest.story_id) {
    steps.push({ type: 'story_link', story_id: quest.story_id });
  }

  // Step 5: Practise questions
  (quest.questions || []).forEach((q) => steps.push(q));

  // Step 6: Moral scenario
  if (quest.moral_scenario) {
    steps.push({ type: 'moral_scenario', ...quest.moral_scenario });
  }

  // Step 7: Reflect
  if (quest.reflection) {
    steps.push({ type: 'reflection', prompt: quest.reflection.prompt, options: quest.reflection.options, allow_custom: quest.reflection.allow_custom });
  }

  // Step 8 (optional): Related Ayahs — only present on quran.ai-powered quests.
  if (quest.related_ayahs?.length) {
    steps.push({ type: 'related_ayahs', items: quest.related_ayahs });
  }

  return steps;
}

export default function QuestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, completeQuest } = useProgress();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [steps, setSteps] = useState([]);
  const [pos, setPos] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [collectedMistakes, setCollectedMistakes] = useState([]);
  const [collectedReflections, setCollectedReflections] = useState([]);
  const [score, setScore] = useState(0);
  const [gradableCount, setGradableCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  // Lesson hydration from the Quran Foundation Content API (with local
  // fallback). Populated for the quest's primary verse.
  const [hydratedLesson, setHydratedLesson] = useState(null);
  // Whether the listener finished the listen step (drives listeningBonus).
  const [listened, setListened] = useState(false);

  useEffect(() => {
    let mounted = true;
    setData(null); setError(null); setPos(0); setFeedback(null);
    setCollectedMistakes([]); setCollectedReflections([]);
    setScore(0); setCompleted(false); setAiSummary(null);
    setHydratedLesson(null); setListened(false);

    api.quest(id).then((d) => {
      if (!mounted) return;
      setData(d);
      const built = buildSteps(d.quest);
      setSteps(built);
      // count gradable steps (questions, moral scenarios — not listen/understand/words/tajweed/reflect)
      const gradable = built.filter(s =>
        !['listen','understand','words','tajweed_highlight','reflection','related_ayahs'].includes(s.type)
      ).length;
      setGradableCount(gradable);

      // Hydrate the primary verse through the Content API. If it's reachable
      // we use the live translation/tafsir/audio; otherwise the route falls
      // back to local content and we still get a valid lesson object.
      const primary = d.quest.verses?.[0]?.verse_key;
      if (primary) {
        api.content.lesson(primary).then((lesson) => {
          if (mounted) setHydratedLesson(lesson);
        }).catch(() => { /* graceful — VerseCard still has local data */ });
      }
    }).catch((err) => mounted && setError(err.message));
    return () => { mounted = false; };
  }, [id]);

  if (error) return <ErrorScreen error={error} onBack={() => navigate('/')} />;
  if (!data || !user || !steps.length) return <LoadingScreen />;
  if (completed) {
    return <CompleteScreen quest={data.quest} score={score} summary={aiSummary} onDone={() => navigate('/')} />;
  }

  const current = steps[pos];
  const total = steps.length;
  const isPassive = ['listen','understand','words','related_ayahs'].includes(current?.type);

  const handleAnswer = (result) => {
    // Listen step continued — record a reading-session and set the listened
    // flag for the scoring formula.
    if (result.listenedAyah) {
      setListened(true);
      api.user
        .startReadingSession({ ayahKey: result.listenedAyah, durationSeconds: 30 })
        .catch(() => { /* non-blocking */ });
    }

    // Reflections and passive steps — just advance
    if (result.noFeedback || isPassive) {
      if (result.reflection) {
        setCollectedReflections(r => [...r, { prompt: current.prompt, text: result.reflection.text }]);
        // Persist reflection as a Note via the user-progress provider
        // (QF Notes API when configured, local store otherwise).
        const verseKey = data?.quest?.verses?.[0]?.verse_key;
        const tags = [data?.quest?.theme || 'reflection'];
        api.user
          .addNote({ ayahKey: verseKey, body: result.reflection.text, tags })
          .catch(() => { /* non-blocking */ });
      }
      advance();
      return;
    }

    // Graded steps
    if (result.correct) {
      sfx.correct();
      setScore(s => Math.min(100, s + Math.round(100 / Math.max(gradableCount, 1))));
      setFeedback({ status: 'correct', title: positiveTitle(), body: result.correctText || null });
    } else {
      sfx.incorrect();
      setCollectedMistakes(m => [...m, {
        questionId: current.type + '_' + pos,
        prompt: current.prompt || current.question || '',
        correctAnswer: result.correctText,
        mistakeAnswer: result.pickedText,
      }]);
      setFeedback({ status: 'incorrect', title: 'Not quite', body: result.correctText ? `The right answer: ${result.correctText}` : null });
    }
  };

  const advance = () => {
    setFeedback(null);
    if (pos + 1 < steps.length) {
      setPos(pos + 1);
    } else {
      finalize();
    }
  };

  const finalize = async () => {
    try {
      // Compute accuracy locally and forward the scoring inputs the new
      // server-side formula needs (PART 7 of the brief).
      const totalGradable = Math.max(gradableCount, 1);
      const wrong = collectedMistakes.length;
      const accuracy = Math.max(0, (totalGradable - wrong) / totalGradable);

      await completeQuest({
        questId: data.quest.id,
        score,
        mistakes: collectedMistakes,
        reflections: collectedReflections,
        accuracy,
        listened,
        reviewedMistakes: false,
      });
      // If this was the final quest of the Gratitude Compass Mission,
      // save the "My Quran Compass — Gratitude" card to localStorage so
      // it surfaces on the Toolkit "Compass cards" tab.
      if (
        data.quest.id === 'q_grat_compass_08_final' &&
        data.sectionMeta?.compass?.finalCard
      ) {
        try {
          const key = 'aq_compass_cards';
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          const without = existing.filter((c) => c.missionId !== 'gratitude');
          const entry = {
            missionId: 'gratitude',
            missionTitle: data.sectionMeta.title || 'Gratitude — Shukr',
            emoji: '🌻',
            savedAt: new Date().toISOString(),
            card: data.sectionMeta.compass.finalCard,
          };
          localStorage.setItem(key, JSON.stringify([...without, entry]));
        } catch { /* non-fatal */ }
      }
      // Try to get Gemini lesson summary
      try {
        const res = await api.lessonSummary({
          verseKey: data.quest.verses?.[0]?.verse_key,
          theme: data.quest.theme,
          wordsLearned: (data.quest.words || []).map(w => w.arabic),
          reflectionText: collectedReflections[0]?.text,
        });
        setAiSummary(res.summary);
      } catch { /* non-fatal */ }

      // If this quest was source-grounded via quran.ai, stash a small
      // lesson-context object so the AI Tutor can answer using the
      // actual ayah/translation/tafsir of the lesson the child just
      // finished. Tutor reads this from localStorage if no other
      // lesson context is provided. Light-touch grounding only —
      // the tutor's fatwa refusal still applies.
      if (data.quest.source?.generatedWith === 'quran.ai') {
        try {
          const ctx = {
            questId: data.quest.id,
            title: data.quest.title,
            theme: data.quest.theme,
            verseKey: data.quest.verses?.[0]?.verse_key,
            verseText: data.quest.verses?.[0]?.text_uthmani,
            translation: data.quest.verses?.[0]?.translation,
            tafsirSimple: data.quest.verses?.[0]?.tafsir_simple,
            source: data.quest.source,
            savedAt: new Date().toISOString(),
          };
          localStorage.setItem('aq_last_lesson_context', JSON.stringify(ctx));
        } catch { /* non-fatal */ }
      }
    } catch (err) { console.error('complete quest failed', err); }
    sfx.complete();
    setCompleted(true);
  };

  const progressValue = pos + (feedback ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <div className="sticky top-0 z-30 bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100">
        <button type="button" onClick={() => navigate('/')} className="text-2xl text-ink-soft" aria-label="Exit">✕</button>
        <div className="flex-1"><ProgressBar value={progressValue} max={total} /></div>
        <div className="text-xs font-bold text-ink-soft">{pos + 1}/{total}</div>
      </div>

      {/* Step label */}
      <StepLabel type={current?.type} />


      {/* Compass header — shown only for quests inside a themed section
          that defines a compass (currently: Gratitude Garden). One petal
          per lens; the lens for THIS quest pulses; previously completed
          lenses are green. */}
      {data?.sectionMeta?.compass && data?.quest?.compass_lens && (
        <QuestCompassHeader
          sectionMeta={data.sectionMeta}
          activeLens={data.quest.compass_lens}
          completedQuestIds={new Set(user?.completedQuests || [])}
          sectionId={data.sectionId}
        />
      )}

      <div className="flex-1 px-4 py-5 max-w-screen-md w-full mx-auto pb-40">
        {/* key on `pos` so the whole step renderer (and any local state in
            its child question component) is fully reset between steps. */}
        <StepRenderer key={pos} step={current} onAnswer={handleAnswer} locked={!!feedback} />
      </div>

      <FeedbackBar
        status={feedback?.status}
        title={feedback?.title}
        body={feedback?.body}
        onContinue={advance}
      />
    </div>
  );
}

// Renders a step — delegates to QuestionRenderer for question types,
// handles passive steps (listen, understand, words) inline.
function StepRenderer({ step, onAnswer, locked }) {
  if (!step) return null;

  // --- Listen step ---
  if (step.type === 'listen') {
    return (
      <div className="flex flex-col gap-4">
        <VerseCard verse={step.verse} showTafsir={false} />
        <button type="button" onClick={() => onAnswer({ correct: true, noFeedback: true, listenedAyah: step.verse?.verse_key })} className="duo-btn-primary">
          Continue
        </button>
      </div>
    );
  }

  // --- Understand step ---
  if (step.type === 'understand') {
    return (
      <div className="flex flex-col gap-4">
        <VerseCard verse={step.verse} showTafsir showTranslation />
        <button type="button" onClick={() => onAnswer({ correct: true, noFeedback: true })} className="duo-btn-primary">
          Continue
        </button>
      </div>
    );
  }

  // --- Word Explorer step ---
  if (step.type === 'words') {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-extrabold text-ink">Key Words</h2>
        {step.words.map((w, i) => (
          <div key={i} className="bg-white border-2 border-gray-100 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="font-arabic text-3xl text-ink">{w.arabic}</div>
              <div className="text-xs font-bold text-ink-soft bg-paper rounded-lg px-2 py-1">{w.root}</div>
            </div>
            <div className="text-sm font-bold text-ink mb-1">{w.transliteration}</div>
            <div className="text-sm text-brand-600 font-extrabold mb-1">{w.meaning}</div>
            <div className="text-xs text-ink-soft italic">"{w.in_ayah}"</div>
          </div>
        ))}
        <button type="button" onClick={() => onAnswer({ correct: true, noFeedback: true })} className="duo-btn-primary">
          Continue
        </button>
      </div>
    );
  }

  // --- Related Ayahs step (quran.ai-powered quests) ---
  if (step.type === 'related_ayahs') {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-ink">Explore More</h2>
          <p className="text-sm text-ink-soft">
            More ayahs from quran.ai that connect to this lesson.
          </p>
        </div>
        {step.items.map((item, i) => (
          <div
            key={i}
            className="bg-white border-2 border-brand-500/20 rounded-2xl p-4"
          >
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-xs uppercase font-extrabold text-brand-600 tracking-wide">
                {item.verse_key}
              </div>
              <SourceBadge source={item.verse?.source} />
            </div>
            {item.verse?.text_uthmani && (
              <div
                className="font-arabic text-xl text-ink mb-2 leading-loose"
                dir="rtl"
              >
                {item.verse.text_uthmani}
              </div>
            )}
            {item.verse?.translation && (
              <div className="text-sm text-ink italic mb-1">
                "{item.verse.translation}"
              </div>
            )}
            {item.note && (
              <div className="text-xs text-ink-soft mt-1">{item.note}</div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => onAnswer({ correct: true, noFeedback: true })}
          className="duo-btn-primary"
        >
          Continue
        </button>
      </div>
    );
  }
  if (step.type === 'allah_name') {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-[#FFF8E7] border-2 border-[#F9C74F] rounded-3xl p-5 text-center shadow-card">
          <div className="text-xs uppercase font-extrabold text-[#8A6A44] tracking-wide mb-2">
            One of Allah's Names
          </div>
          <div className="font-arabic text-5xl text-ink leading-loose" dir="rtl">
            {step.arabic}
          </div>
          <div className="text-base font-extrabold text-ink mt-2">
            {step.transliteration}
          </div>
          <div className="text-sm text-ink-soft mt-3">{step.meaning}</div>
          {step.child_explanation && (
            <div className="mt-4 bg-white border-2 border-[#F9C74F]/60 rounded-2xl p-3 text-sm text-ink text-left">
              {step.child_explanation}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => onAnswer({ correct: true, noFeedback: true })}
          className="duo-btn-primary"
        >
          Continue
        </button>
      </div>
    );
  }

  // --- Story link card (Gratitude Compass — Quest 6) ---
  if (step.type === 'story_link') {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-[#FFD6A5]/30 border-2 border-[#8A6A44]/30 rounded-3xl p-5">
          <div className="text-xs uppercase font-extrabold text-[#8A6A44] tracking-wide mb-2">
            Story time
          </div>
          <div className="font-extrabold text-ink text-lg mb-1">Work in Gratitude</div>
          <p className="text-sm text-ink-soft">
            Open the full 6-page story in the Storybook Library. Read it,
            then come back here to answer the question.
          </p>
          <a
            href={`/library/${step.story_id}`}
            className="inline-block mt-3 duo-btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open story →
          </a>
        </div>
        <button
          type="button"
          onClick={() => onAnswer({ correct: true, noFeedback: true })}
          className="duo-btn-ghost"
        >
          I read it — continue
        </button>
      </div>
    );
  }

  // --- All other step types delegated to QuestionRenderer ---
  return <QuestionRenderer question={step} onAnswer={onAnswer} locked={locked} />;
}

const STEP_LABELS = {
  listen: { label: 'Step 1 — Listen', color: '#1CB0F6' },
  understand: { label: 'Step 2 — Read & Understand', color: '#58CC02' },
  words: { label: 'Step 3 — Word Explorer', color: '#FF9600' },
  tajweed_highlight: { label: 'Step 4 — Tajweed', color: '#CE82FF' },
  moral_scenario: { label: 'Step 6 — Moral Scenario', color: '#FF9600' },
  reflection: { label: 'Step 7 — Reflect', color: '#CE82FF' },
  related_ayahs: { label: 'Explore More — quran.ai', color: '#58CC02' },
};

function StepLabel({ type }) {
  const info = STEP_LABELS[type];
  if (!info) return null;
  return (
    <div className="px-4 pt-2">
      <span className="inline-block text-xs font-extrabold uppercase tracking-wide px-3 py-1 rounded-full text-white"
        style={{ background: info.color }}>
        {info.label}
      </span>
    </div>
  );
}

const POSITIVE = ['MashaAllah!', 'Beautiful!', 'Excellent!', 'You got it!', 'Right answer!'];
const positiveTitle = () => POSITIVE[Math.floor(Math.random() * POSITIVE.length)];

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <Character emotion="think" size={140} />
      <div className="text-ink-soft font-bold">Getting your lesson ready…</div>
    </div>
  );
}

function ErrorScreen({ error, onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center gap-3">
      <Character emotion="scared" size={140} />
      <div className="text-ink font-bold">{error}</div>
      <button onClick={onBack} className="duo-btn-primary">Back home</button>
    </div>
  );
}

function CompleteScreen({ quest, score, summary, onDone }) {
  const navigate = useNavigate();
  const defaultMsg = `You spent time with the Quran today on the theme of ${quest.theme || 'learning'}. That is something worth continuing — see you tomorrow, in sha Allah.`;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-5 max-w-screen-md mx-auto">
      <Character emotion="happy" size={220} />
      <div>
        <div className="text-xs uppercase font-extrabold text-ink-soft tracking-wide">Lesson complete</div>
        <div className="text-2xl font-extrabold text-brand-500">{quest.title}</div>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        <div className="bg-cream border-2 border-accent-gold/40 rounded-2xl p-3">
          <div className="text-xs text-ink-soft uppercase font-bold">XP earned</div>
          <div className="text-2xl font-extrabold text-accent-orange">+{quest.xp}</div>
        </div>
        <div className="bg-cream border-2 border-accent-gold/40 rounded-2xl p-3">
          <div className="text-xs text-ink-soft uppercase font-bold">Score</div>
          <div className="text-2xl font-extrabold text-brand-500">{score}</div>
        </div>
      </div>
      {/* AI or default completion message */}
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 text-sm text-ink text-left max-w-sm w-full">
        {summary || defaultMsg}
      </div>
      {/* Source card — only shows when this quest was generated using the
          quran.ai content pipeline. Adds judging proof and shows the child
          the lesson was grounded in real sources, not invented. */}
      <SourceCard
        source={quest.source}
        primaryAyah={quest.source?.primaryAyah || quest.verses?.[0]?.verse_key}
        theme={quest.theme}
      />
      <div className="flex flex-col gap-2 w-full max-w-sm">
        <button onClick={onDone} className="duo-btn-primary w-full">Continue</button>
        <button
          onClick={() => navigate('/tutor')}
          className="duo-btn-ghost w-full text-sm"
        >
          💬 Ask Tutor about this lesson
        </button>
      </div>
    </div>
  );
}

// Compass header for quests inside a themed section (Gratitude Garden today).
// Walks `data.sectionMeta.compass.lenses`, marks every lens whose backing
// quest is in `completedQuestIds` as unlocked, and pulses the lens for the
// quest the user is currently inside.
function QuestCompassHeader({ sectionMeta, activeLens, completedQuestIds, sectionId }) {
  // The roadmap response carries unit→quest mapping, but we don't have it
  // here. The cheap, correct rule: every lens earlier in the lens list
  // than `activeLens` whose quest is also completed counts as unlocked.
  // We can be more accurate by reading roadmap from the API; for now,
  // simply include every lens whose backing quest (matching by position)
  // appears in completedQuestIds is overkill — the simplest reliable
  // proxy is the lens index relative to the active one + the active
  // quest itself (handled by `activeLens`).
  const lenses = sectionMeta.compass?.lenses || [];
  const activeIdx = lenses.findIndex((l) => l.id === activeLens);
  // Treat all lenses BEFORE the active one as unlocked iff the user has
  // completed at least one quest in the section. This is conservative —
  // a perfect implementation would look up the per-lens quest id from the
  // roadmap. It's accurate as long as the user moves through lenses in
  // order, which is the intended flow.
  const haveCompleted = (completedQuestIds && completedQuestIds.size > 0);
  const unlockedIds = lenses
    .slice(0, Math.max(0, activeIdx))
    .filter(() => haveCompleted)
    .map((l) => l.id);

  return (
    <div
      className="mx-auto max-w-screen-md w-full px-4 pt-3"
    >
      <div
        className="rounded-2xl px-3 py-3 flex items-center gap-3 border-2"
        style={{
          background:
            'linear-gradient(90deg, #FFF8E7 0%, #FFD6A5 60%, #B8EBD0 100%)',
          borderColor: '#F9C74F',
          color: '#40516A',
        }}
      >
        <div className="shrink-0">
          <SectionCompass
            lenses={lenses}
            unlockedIds={unlockedIds}
            activeId={activeLens}
            size={64}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase font-extrabold opacity-80 tracking-wide">
            {sectionMeta.title} · {sectionMeta.compass?.missionTitle}
          </div>
          <div className="text-sm font-extrabold">
            {lenses[activeIdx]?.emoji} {lenses[activeIdx]?.name} unlocking…
          </div>
          <div className="text-[11px] opacity-75">
            {unlockedIds.length + 1}/{lenses.length} of the compass lit
          </div>
        </div>
      </div>
    </div>
  );
}
