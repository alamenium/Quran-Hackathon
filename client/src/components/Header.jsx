import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext.jsx';
import { SideDrawer } from './SideDrawer.jsx';
import { profileImage } from '../lib/characters.js';

export function Header({ showLogo = true }) {
  const { user } = useProgress();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between gap-2">
        {showLogo && <Logo />}

        {user && (
          <div className="flex items-center gap-1.5">
            <div className="chip text-accent-orange select-none" title="Day streak">
              <span className="text-sm leading-none">🔥</span>
              <span className="tabular-nums">{user.streak.current}</span>
            </div>
            <div className="chip text-accent-gold select-none" title="Total XP">
              <span className="text-sm leading-none">⭐</span>
              <span className="tabular-nums">{user.xp}</span>
            </div>
            {/* Avatar button — shows the child's profile picture */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-brand-200 hover:border-brand-400 transition ml-1 shrink-0"
              aria-label="Open menu"
            >
              <img
                src={profileImage(user.character || 'boy1')}
                alt="My character"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        )}
      </header>

      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img src="/brand/logo.jpg" alt="AyahQuest" className="h-8 w-auto rounded-lg object-contain" />
    </Link>
  );
}
