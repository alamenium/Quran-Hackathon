import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext.jsx';
import { profileImage } from '../lib/characters.js';

// Side drawer — slides in from the right when the menu button in the
// Header is tapped.
export function SideDrawer({ open, onClose }) {
  const { user } = useProgress();
  const navigate = useNavigate();

  function go(to) {
    onClose();
    navigate(to);
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        {/* Header strip */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-extrabold text-ink text-base">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-ink-soft hover:bg-paper transition"
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* App profile snippet */}
        {user && (
          <button
            type="button"
            onClick={() => go('/profile')}
            className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 hover:bg-paper transition w-full text-left"
          >
            <img
              src={profileImage(user.character || 'boy1')}
              alt=""
              className="w-12 h-12 rounded-full object-contain bg-paper border border-gray-100"
            />
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-ink text-sm truncate">
                {user.id.startsWith('user_') ? 'My Profile' : user.id}
              </div>
              <div className="text-xs text-ink-soft mt-0.5">
                {user.xp} XP · {user.streak.current} day streak
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-ink-faint shrink-0">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {/* Nav links */}
        <nav className="flex-1 px-3 py-3 flex flex-col gap-1 overflow-y-auto">
          <DrawerLink icon="📖" label="Story Library" sub="Quran stories with audio" onClick={() => go('/library')} />
          <DrawerLink icon="💬" label="Ask Tutor" sub="AI help with your lessons" onClick={() => go('/tutor')} />
          <DrawerLink icon="🎒" label="My Toolkit" sub="Words, bookmarks, reflections" onClick={() => go('/toolkit')} />
          <DrawerLink icon="🎧" label="Listen & Follow" sub="Audio recitation mode" onClick={() => go('/listen')} />
          <div className="border-t border-gray-100 my-2" />
          <DrawerLink icon="⚙️" label="Settings" sub="Character, placement, about" onClick={() => go('/profile')} />
          <DrawerLink icon="🩹" label="Review Mistakes" sub="Go over past errors" onClick={() => go('/toolkit')} />
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-[10px] text-ink-faint text-center">
            AyahQuest · Quran for children
          </p>
        </div>
      </div>
    </>
  );
}

function DrawerLink({ icon, label, sub, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-paper transition w-full text-left group"
    >
      <span className="text-xl w-8 text-center shrink-0" aria-hidden>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-ink">{label}</div>
        {sub && <div className="text-xs text-ink-faint">{sub}</div>}
      </div>
    </button>
  );
}
