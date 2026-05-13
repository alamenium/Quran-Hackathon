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

  useEffect(() => {
    let mounted = true;
    setData(null); setError(null); setPos(0); setFeedback(null);
    setCollectedMistakes([]); setCollectedReflections([]);
    setScore(0); setCompleted(false); setAiSummary(null);

    api.quest(id).then((d) => {
      if (!mounted) return;
      setData(d);
      const built = buildSteps(d.quest);
      setSteps(built);
      // count gradable steps (questions, moral scenarios — not listen/understand/words/tajweed/reflect)
      const gradable = built.filter(s =>
        !['listen','understand','words','tajweed_highlight','reflection'].includes(s.type)
      ).length;
      setGradableCount(gradable);
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
  const isPassive = ['listen','understand','words'].includes(current?.type);

  const handleAnswer = (result) => {
    // Reflections and passive steps — just advance
    if (result.noFeedback || isPassive) {
      if (result.reflection) {
        setCollectedReflections(r => [...r, { prompt: current.prompt, text: result.reflection.text }]);
      }
      advance();
      return;
    }

    // Graded steps
    if (result.correct) {
      setScore(s => Math.min(100, s + Math.round(100 / Math.max(gradableCount, 1))));
      setFeedback({ status: 'correct', title: positiveTitle(), body: result.correctText || null });
    } else {
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
      await completeQuest({
        questId: data.quest.id,
        score,
        reflections: collectedReflections,
      });
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
    } catch (err) { console.error('complete quest failed', err); }
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

      <div className="flex-1 px-4 py-5 max-w-screen-md w-full mx-auto pb-40">
        <StepRenderer step={current} onAnswer={handleAnswer} locked={!!feedback} />
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
        <button type="button" onClick={() => onAnswer({ correct: true, noFeedback: true })} className="duo-btn-primary">
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
      <button onClick={onDone} className="duo-btn-primary w-full max-w-sm">Continue</button>
    </div>
  );
}
