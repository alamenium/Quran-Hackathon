import { NavLink } from 'react-router-dom';

// 3-tab nav: Learn | Compass | Recite
// Profile, Library, Tutor are in the side drawer (see Header).
const items = [
  {
    to: '/',
    label: 'Learn',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3L2 9l10 6 10-6-10-6z" fill="currentColor" opacity=".9"/>
        <path d="M2 15l10 6 10-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  {
    to: '/compass',
    label: 'Compass',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 8l2 4-2 4-2-4 2-4z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    to: '/classes',
    label: 'Recite',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 8c0 0 .5 3 4 3s4-3 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M12 11v3M9 17c0-1.7 1.3-3 3-3s3 1.3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <ul className="grid grid-cols-3 max-w-sm mx-auto">
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              end={it.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-bold tracking-wide transition-colors ${
                  isActive ? 'text-brand-500' : 'text-ink-faint'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                    {it.icon}
                  </span>
                  <span>{it.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
