import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Character } from '../components/Character.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { characterImage } from '../lib/characters.js';
import { OrderEvents } from '../components/questions/OrderEvents.jsx';
import { ChooseMeaning } from '../components/questions/ChooseMeaning.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';

export default function StoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useProgress();
  const [story, setStory] = useState(null);
  const [page, setPage] = useState(0);
  const [activityIdx, setActivityIdx] = useState(null); // null until reaching activity
  const [activityResults, setActivityResults] = useState({ order: null, lesson: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    api.story(id).then((d) => setStory(d.story)).catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-3">
        <Character emotion="scared" size={140} />
        <div className="text-ink font-bold">{error}</div>
        <button onClick={() => navigate('/library')} className="duo-btn-primary">
          Back to library
        </button>
      </div>
    );
  }
  if (!story || !user) return null;

  const totalPages = story.pages.length;
  const onLastPage = page === totalPages - 1;
  const reachedActivity = activityIdx !== null;

  const next = () => {
    if (!onLastPage) {
      setPage(page + 1);
    } else if (!reachedActivity) {
      setActivityIdx(0);
    }
  };

  const back = () => {
    if (reachedActivity) {
      setActivityIdx(null);
    } else if (page > 0) {
      setPage(page - 1);
    } else {
      navigate('/library');
    }
  };

  if (!reachedActivity) {
    const p = story.pages[page];
    const charSrc = characterImage(user.character, p.emotion || story.cover_emotion);
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <div className="px-4 py-3 flex items-center gap-3 border-b border-accent-gold/30 bg-white">
          <button onClick={back} className="text-2xl text-ink-soft" aria-label="Back">
            ✕
          </button>
          <div className="flex-1">
            <ProgressBar value={page + 1} max={totalPages} />
          </div>
          <div className="text-xs font-bold text-ink-soft">
            {page + 1}/{totalPages}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center px-5 py-6 max-w-screen-md mx-auto w-full">
          <img
            src={charSrc}
            alt=""
            className="w-56 h-56 object-contain mb-4"
          />
          <div className="bg-white border-2 border-accent-gold/40 rounded-3xl p-5 shadow-card text-base text-ink leading-relaxed">
            {p.text}
          </div>
        </div>

        <div className="px-4 pb-6 pt-2" style={{ paddingBottom: 'calc(1.5rem + var(--safe-bottom))' }}>
          <button onClick={next} className="duo-btn-primary w-full max-w-screen-md mx-auto block">
            {onLastPage ? 'Start Activity' : 'Next →'}
          </button>
        </div>
      </div>
    );
  }

  // Activity: order_events then lesson_question
  const { activity } = story;
  if (activityIdx === 0) {
    // order events
    return (
      <div className="min-h-screen flex flex-col bg-paper">
        <Header onBack={back} title="Activity 1 of 2" />
        <div className="flex-1 px-4 py-5 max-w-screen-md mx-auto w-full">
          <OrderEvents
            question={{
              prompt: activity.prompt,
              items: activity.items,
            }}
            onAnswer={(res) => {
              setActivityResults((r) => ({ ...r, order: res.correct }));
              setActivityIdx(1);
            }}
          />
        </div>
      </div>
    );
  }
  if (activityIdx === 1) {
    return (
      <div className="min-h-screen flex flex-col bg-paper">
        <Header onBack={back} title="Activity 2 of 2" />
        <div className="flex-1 px-4 py-5 max-w-screen-md mx-auto w-full">
          <ChooseMeaning
            question={activity.lesson_question}
            onAnswer={(res) => {
              setActivityResults((r) => ({ ...r, lesson: res.correct }));
              setActivityIdx(2);
            }}
          />
        </div>
      </div>
    );
  }
  // Done
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center gap-5 max-w-screen-md mx-auto">
      <Character emotion="happy" size={220} />
      <div className="text-3xl font-extrabold text-brand-500">
        Story Finished!
      </div>
      <div className="text-ink-soft max-w-sm">
        Activity:{' '}
        {activityResults.order ? '✅ ordering' : '↻ ordering'} ·{' '}
        {activityResults.lesson ? '✅ lesson' : '↻ lesson'}
      </div>
      <button onClick={() => navigate('/library')} className="duo-btn-primary w-full max-w-sm">
        Back to Library
      </button>
    </div>
  );
}

function Header({ onBack, title }) {
  return (
    <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 bg-white">
      <button onClick={onBack} className="text-2xl text-ink-soft" aria-label="Back">
        ←
      </button>
      <div className="font-extrabold text-ink">{title}</div>
    </div>
  );
}
