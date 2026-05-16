import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { Character } from '../components/Character.jsx';
import { SpeechBubble } from '../components/SpeechBubble.jsx';
import { ChooseMeaning } from '../components/questions/ChooseMeaning.jsx';
import { ListenChoose } from '../components/questions/ListenChoose.jsx';
import { TapAyahLesson } from '../components/questions/TapAyahLesson.jsx';
import { useProgress } from '../context/ProgressContext.jsx';

export default function DiagnosticPage() {
  const navigate = useNavigate();
  const { setPlacement } = useProgress();
  const [questions, setQuestions] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(null);

  useEffect(() => {
    api.diagnostic().then((d) => setQuestions(d.questions));
  }, []);

  if (!questions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Character emotion="think" size={120} />
        <div className="text-ink-soft mt-3">Loading the quick test…</div>
      </div>
    );
  }

  if (done) {
    return <PlacementResult result={done} onContinue={() => navigate('/')} />;
  }

  const handleAnswer = async (q, result) => {
    const updated = [...answers, { id: q.id, correct: result.correct }];
    setAnswers(updated);

    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
    } else {
      // score
      const scored = await api.scoreDiagnostic(updated);
      await setPlacement({
        sectionId: scored.sectionId,
        level: scored.level,
        scorePct: scored.scorePct,
      });
      setDone(scored);
    }
  };

  const q = questions[idx];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 bg-white">
        <button
          type="button"
          onClick={() => navigate('/welcome')}
          className="text-2xl text-ink-soft"
          aria-label="Back"
        >
          ✕
        </button>
        <div className="flex-1">
          <ProgressBar value={idx} max={questions.length} />
        </div>
        <div className="text-xs font-bold text-ink-soft">
          {idx + 1}/{questions.length}
        </div>
      </div>

      <div className="flex-1 px-4 py-5 max-w-screen-md w-full mx-auto">
        {renderQ(q, (res) => handleAnswer(q, res))}
      </div>
    </div>
  );
}

function renderQ(q, onAnswer) {
  // Key on q.id so React unmounts + remounts the child between questions —
  // prevents the previous question's local state (selected option, etc.)
  // from carrying over.
  switch (q.type) {
    case 'choose_meaning':
      return <ChooseMeaning key={q.id} question={q} onAnswer={onAnswer} />;
    case 'listen_choose':
      return <ListenChoose key={q.id} question={q} onAnswer={onAnswer} />;
    case 'tap_ayah_lesson':
      return <TapAyahLesson key={q.id} question={q} onAnswer={onAnswer} />;
    default:
      return <div>Unsupported diagnostic question.</div>;
  }
}

function PlacementResult({ result, onContinue }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-5 max-w-screen-md mx-auto">
      <Character emotion="star" size={220} />
      <div>
        <div className="text-xs uppercase font-extrabold text-ink-soft tracking-wide">
          Your starting level
        </div>
        <div className="text-3xl font-extrabold text-brand-500 capitalize">
          {result.level}
        </div>
      </div>
      <SpeechBubble>
        <div className="max-w-sm font-bold">{result.message}</div>
      </SpeechBubble>
      <div className="text-sm text-ink-soft">
        You scored {result.scorePct}% on the quick check-in.
      </div>
      <button onClick={onContinue} className="duo-btn-primary w-full max-w-sm">
        Go to my Quests
      </button>
    </div>
  );
}
