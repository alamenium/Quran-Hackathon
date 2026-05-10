import { Link } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext.jsx';

export function Header({ showLogo = true }) {
  const { user } = useProgress();
  if (!user) {
    return (
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        {showLogo && <Logo />}
      </header>
    );
  }
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between gap-2">
      {showLogo && <Logo />}
      <div className="flex items-center gap-2">
        <Link to="/toolkit" className="chip text-accent-orange" aria-label="Streak">
          <span className="text-base">🔥</span>
          <span>{user.streak.current}</span>
        </Link>
        <Link to="/toolkit" className="chip text-accent-gold" aria-label="XP">
          <span className="text-base">⭐</span>
          <span>{user.xp}</span>
        </Link>
        <Link to="/" className="chip text-accent-pink" aria-label="Hearts">
          <Hearts count={user.hearts} />
        </Link>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-brand-500 text-lg">
      <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden>
        <rect width="64" height="64" rx="14" fill="#58CC02" />
        <path d="M32 14 L46 32 L32 50 L18 32 Z" fill="#FFF9EE" />
        <circle cx="32" cy="32" r="6" fill="#58CC02" />
      </svg>
      AyahQuest
    </Link>
  );
}

function Hearts({ count }) {
  const pips = [];
  for (let i = 0; i < 3; i++) {
    pips.push(
      <span
        key={i}
        className={`w-3 h-3 rounded-full inline-block ${i < count ? 'bg-accent-pink' : 'bg-gray-200'}`}
      />
    );
  }
  return <span className="flex items-center gap-1">{pips}</span>;
}
