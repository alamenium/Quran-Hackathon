import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useProgress } from '../context/ProgressContext.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { FeedbackBar } from '../components/FeedbackBar.jsx';
import { QuestionRenderer } from '../components/questions/QuestionRenderer.jsx';
import { Character } from '../components/Character.jsx';
import { SpeechBubble } from '../components/SpeechBubble.jsx';

const HEART_LIMIT = 3;

export default function QuestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, completeQuest } = useProgress();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // session state
  const [questionQueue, setQuestionQueue] = useState([]); // current run queue
  const [pos, setPos] = useState(0);
  const [feedback, setFeedback] = useState(null); // { status, title, body }
  const [hearts, setHearts] = useState(HEART_LIMIT);
  const [reviewMode, setReviewMode] = useState(false);
  const [collectedMistakes, setCollectedMistakes] = useState([]);
  const [collectedReflections, setCollectedReflections] = useState([]);
  const [score, setScore] = useState(0); // 0..100 lite
  const [completed, setCompleted] = useState(false);

  // load quest
  useEffect(() => {
    let mounted = true;
    setData(null);
    setError(null);
    api
      .quest(id)
      .then((d) => {
        if (!mounted) return;
        setData(d);
        setQuestionQueue(d.quest.questions.map((q, i) => ({ ...q, _idx: i })));
        setPos(0);
        setFeedback(null);
        setHearts(HEART_LIMIT);
        setReviewMode(false);
        setCollectedMistakes([]);
        setCollectedReflections([]);
        setScore(0);
        setCompleted(false);
      })
      .catch((err) => mounted && setError(err.message));
    return () => {
      mounted = false;
    };
  }, [id]);

  const total = useMemo(() => data?.quest?.questions?.length || 0, [data]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center gap-3">
        <Character emotion="scared" size={140} />
        <div className="text-ink font-bold">{error}</div>
        <button onClick={() => navigate('/')} className="duo-btn-primary">
          Back home
        </button>
      </div>
    );
  }
  if (!data || !user) return <LoadingQuest />;

  if (completed) {
    return (
      <CompleteScreen
        quest={data.quest}
        score={score}
        onDone={() => navigate('/')}
      />
    );
  }

  const current = questionQueue[pos];
  if (!current) return <LoadingQuest />;

  const handleAnswer = (result) => {
    // Reflections / skipped recitations don't trigger feedback or hearts
    if (result.noFeedback) {
      if (result.reflection) {
        setCollectedReflections((arr) => [
          ...arr,
          {
            prompt: result.reflection.prompt,
            text: result.reflection.text,
            questionId: current.type + '_' + current._idx,
          },
        ]);
      }
      advance();
      return;
    }

    if (result.correct) {
      setScore((s) => Math.min(100, s + Math.round(100 / total)));
      setFeedback({
        status: 'correct',
        title: bigCorrectTitle(),
        body: result.correctText,
      });
    } else {
      setHearts((h) => Math.max(0, h - 1));
      const mistake = {
        questionId: current.type + '_' + current._idx,
        prompt: current.prompt,
        correctAnswer: result.correctText,
        mistakeAnswer: result.pickedText,
      };
      setCollectedMistakes((arr) => [...arr, mistake]);
      setFeedback({
        status: 'incorrect',
        title: 'Not quite',
        body: result.correctText
          ? `The right answer is: ${result.correctText}`
          : "Let's review this one and try again.",
      });
    }
  };

  const advance = () => {
    setFeedback(null);
    if (pos + 1 < questionQueue.length) {
      setPos(pos + 1);
      return;
    }

    // End of queue. If we have any mistakes AND we haven't entered review yet,
    // re-queue them for review and don't fail the quest.
    if (collectedMistakes.length > 0 && !reviewMode) {
      // Build a small review queue from the collected mistakes by mapping
      // questionId back to original question objects.
      const reviewQs = data.quest.questions.filter((q, i) =>
        collectedMistakes.some(
          (m) => m.questionId === q.type + '_' + i
        )
      ).map((q, i) => ({ ...q, _idx: 'r' + i }));

      if (reviewQs.length > 0) {
        setReviewMode(true);
        setQuestionQueue(reviewQs);
        setPos(0);
        setFeedback({
          status: 'correct',
          title: 'Review Mode',
          body:
            "You're done with the questions. Let's gently fix the ones you missed before we finish.",
        });
        return;
      }
    }

    finalize();
  };

  const finalize = async () => {
    try {
      await completeQuest({
        questId: data.quest.id,
        score,
        mistakes: [], // we keep mistakes for ongoing review queue intentionally
        reflections: collectedReflections.map((r) => ({
          prompt: r.prompt,
          text: r.text,
        })),
      });
    } catch (err) {
      console.error('quest-complete failed', err);
    }
    setCompleted(true);
  };

  const totalRun = questionQueue.length;
  const progressValue = pos + (feedback ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <div className="sticky top-0 z-30 bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-2xl text-ink-soft"
          aria-label="Exit quest"
        >
          ✕
        </button>
        <div className="flex-1">
          <ProgressBar value={progressValue} max={totalRun} />
        </div>
        <div className="flex items-center gap-1 text-accent-pink font-extrabold">
          <span>♥</span>
          <span>{hearts}</span>
        </div>
      </div>

      {reviewMode && (
        <div className="bg-accent-purple/10 border-b border-accent-purple/30 px-4 py-2 text-center text-xs font-extrabold text-accent-purple uppercase tracking-wide">
          Review Mode — let's fix these together
        </div>
      )}

      <div className="flex-1 px-4 py-5 max-w-screen-md w-full mx-auto pb-40">
        <QuestionRenderer
          question={current}
          onAnswer={handleAnswer}
          locked={!!feedback}
        />
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

const POSITIVE_TITLES = [
  'MashaAllah!',
  'Beautiful!',
  'Excellent!',
  'You got it!',
  'Right answer!',
];

function bigCorrectTitle() {
  return POSITIVE_TITLES[Math.floor(Math.random() * POSITIVE_TITLES.length)];
}

function LoadingQuest() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <Character emotion="think" size={140} />
      <SpeechBubble>
        <span className="text-sm">Getting your quest ready…</span>
      </SpeechBubble>
    </div>
  );
}

function CompleteScreen({ quest, score, onDone }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-5 max-w-screen-md mx-auto">
      <Character emotion="happy" size={240} />
      <div>
        <div className="text-xs uppercase font-extrabold text-ink-soft tracking-wide">
          Quest complete
        </div>
        <div className="text-3xl font-extrabold text-brand-500">{quest.title}</div>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        <div className="bg-cream border-2 border-accent-gold/40 rounded-2xl p-3">
          <div className="text-xs text-ink-soft uppercase font-bold">XP</div>
          <div className="text-2xl font-extrabold text-accent-orange">
            +{quest.xp}
          </div>
        </div>
        <div className="bg-cream border-2 border-accent-gold/40 rounded-2xl p-3">
          <div className="text-xs text-ink-soft uppercase font-bold">Score</div>
          <div className="text-2xl font-extrabold text-brand-500">{score}</div>
        </div>
      </div>
      <button onClick={onDone} className="duo-btn-primary w-full max-w-sm">
        Continue
      </button>
    </div>
  );
}
