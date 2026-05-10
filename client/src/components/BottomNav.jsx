import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Learn', icon: '🏠' },
  { to: '/library', label: 'Stories', icon: '📖' },
  { to: '/listen', label: 'Listen', icon: '🎧' },
  { to: '/toolkit', label: 'Toolkit', icon: '🎒' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <ul className="grid grid-cols-5 max-w-screen-md mx-auto">
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              end={it.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2.5 text-xs font-bold transition ${
                  isActive ? 'text-brand-500' : 'text-ink-soft'
                }`
              }
            >
              <span className="text-2xl leading-none mb-1" aria-hidden>
                {it.icon}
              </span>
              <span>{it.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
