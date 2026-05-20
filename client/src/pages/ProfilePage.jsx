import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext.jsx';
import { Character } from '../components/Character.jsx';
import { listCharacters, characterImage, profileImage } from '../lib/characters.js';
import { api } from '../lib/api.js';

export default function ProfilePage() {
  const { user, setCharacter } = useProgress();
  const navigate = useNavigate();
  const [source, setSource] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [qfAuth, setQfAuth] = useState(null); // { authenticated, user }

  useEffect(() => {
    api.source().then((d) => setSource(d.source)).catch(() => {});
    api.recitationStatus().then(setAiStatus).catch(() => {});
    // Check if already signed in to Quran Foundation
    api.auth.me().then(setQfAuth).catch(() => {});
  }, []);

  if (!user) return null;
  const characters = listCharacters();

  return (
    <div className="px-4 py-4 pb-32 max-w-screen-md mx-auto flex flex-col gap-5">
      <div className="text-center pt-4">
        <Character emotion="happy" size={180} />
        <div className="text-2xl font-extrabold text-ink mt-2">
          {user.id.startsWith('user_') ? 'Quran Friend' : user.id}
        </div>
        <div className="text-sm text-ink-soft">
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Streak" value={user.streak.current} sub={`Best: ${user.streak.longest}`} />
        <Stat label="XP" value={user.xp} sub={`${user.completedQuests.length} quests`} />
      </div>

      {/* Quran Foundation login — User API integration */}
      <Card title="Quran.Foundation Account">
        {qfAuth?.authenticated ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-ink">
                Signed in as {qfAuth.user?.firstName || qfAuth.user?.email || 'Quran.Foundation user'}
              </div>
              <div className="text-xs text-brand-500 mt-0.5">
                ✓ Bookmarks, notes &amp; streaks syncing to Quran.Foundation
              </div>
            </div>
            <button
              type="button"
              onClick={() => api.auth.logout()}
              className="duo-btn-ghost text-xs px-3 py-2"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-ink-soft mb-3">
              Sign in to sync your bookmarks, reflection notes, and reading streaks with Quran.Foundation.
            </p>
            <button
              type="button"
              onClick={() => api.auth.login()}
              className="w-full py-3 rounded-2xl font-extrabold text-white text-sm tracking-wide transition"
              style={{ background: '#58CC02' }}
            >
              Sign in with Quran.Foundation
            </button>
            <p className="text-[10px] text-ink-faint text-center mt-2">
              OAuth2 Authorization Code + PKCE · tokens stored server-side only
            </p>
          </div>
        )}
      </Card>

      <Card title="Pick your character">
        <div className="grid grid-cols-2 gap-3">
          {characters.map((char) => (
            <button
              key={char.id}
              type="button"
              onClick={() => setCharacter(char.id)}
              className={`rounded-3xl border-2 p-3 text-center bg-white transition ${
                user.character === char.id
                  ? 'border-brand-500 shadow-card'
                  : 'border-gray-200'
              }`}
            >
              <img
                src={profileImage(char.id)}
                alt={char.name}
                className="w-24 h-24 mx-auto object-contain"
              />
              <div className="font-bold text-ink mt-1 text-sm">{char.name}</div>
            </button>
          ))}
        </div>
      </Card>

      {user.placement && (
        <Card title="Placement">
          <div className="text-sm">
            Starting level:{' '}
            <span className="font-extrabold text-brand-500 capitalize">
              {user.placement.level}
            </span>
          </div>
          <div className="text-sm">
            Score: <span className="font-bold">{user.placement.scorePct}%</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/diagnostic')}
            className="duo-btn-ghost mt-3 text-sm"
          >
            Retake the check-in
          </button>
        </Card>
      )}

      <Card title="About">
        <div className="text-sm text-ink-soft space-y-2">
          <div>
            <span className="font-extrabold text-ink">Quran content:</span>{' '}
            {source === 'quran-foundation-api' ? (
              <span className="text-brand-500 font-bold">Quran Foundation Content APIs (live)</span>
            ) : (
              <span className="text-ink">Bundled offline dataset</span>
            )}
          </div>
          <div>
            <span className="font-extrabold text-ink">Recitation check:</span>{' '}
            {aiStatus?.reachable ? (
              <span className="text-brand-500 font-bold">AI mode — faster-whisper</span>
            ) : (
              <span className="text-ink">Web Speech API fallback</span>
            )}
          </div>
          <div className="text-xs text-ink-faint">
            User ID: <code>{api.userId()}</code>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 text-center">
      <div className="text-3xl font-extrabold text-ink">{value}</div>
      <div className="text-xs uppercase text-ink-soft font-bold">{label}</div>
      {sub && <div className="text-xs text-ink-faint mt-1">{sub}</div>}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 shadow-card">
      <div className="text-xs uppercase font-extrabold text-ink-faint mb-3">
        {title}
      </div>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { user, setCharacter } = useProgress();
  const navigate = useNavigate();
  const [source, setSource] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);

  useEffect(() => {
    api.source().then((d) => setSource(d.source)).catch(() => {});
    api.recitationStatus().then(setAiStatus).catch(() => {});
  }, []);

  if (!user) return null;
  const characters = listCharacters();

  return (
    <div className="px-4 py-4 pb-32 max-w-screen-md mx-auto flex flex-col gap-5">
      <div className="text-center pt-4">
        <Character emotion="happy" size={200} />
        <div className="text-2xl font-extrabold text-ink mt-2">
          {user.id.startsWith('user_') ? 'Quran Friend' : user.id}
        </div>
        <div className="text-sm text-ink-soft">
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Streak" value={user.streak.current} sub={`Best: ${user.streak.longest}`} />
        <Stat label="XP" value={user.xp} sub={`${user.completedQuests.length} quests`} />
      </div>

      <Card title="Pick your character">
        <div className="grid grid-cols-2 gap-3">
          {characters.map((char) => (
            <button
              key={char.id}
              type="button"
              onClick={() => setCharacter(char.id)}
              className={`rounded-3xl border-2 p-3 text-center bg-white transition ${
                user.character === char.id
                  ? 'border-brand-500 shadow-card'
                  : 'border-gray-200'
              }`}
            >
              <img
                src={profileImage(char.id)}
                alt={char.name}
                className="w-24 h-24 mx-auto object-contain"
              />
              <div className="font-bold text-ink mt-1 text-sm">{char.name}</div>
            </button>
          ))}
        </div>
        {characters.length === 1 && (
          <div className="text-xs text-ink-faint mt-3 text-center">
            Add a folder to <code className="bg-paper px-1 rounded">/characters/</code> with the same naming scheme to add more characters.
          </div>
        )}
      </Card>

      {user.placement && (
        <Card title="Placement">
          <div className="text-sm">
            Starting level:{' '}
            <span className="font-extrabold text-brand-500 capitalize">
              {user.placement.level}
            </span>
          </div>
          <div className="text-sm">
            Score: <span className="font-bold">{user.placement.scorePct}%</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/diagnostic')}
            className="duo-btn-ghost mt-3 text-sm"
          >
            Retake the check-in
          </button>
        </Card>
      )}

      <Card title="About">
        <div className="text-sm text-ink-soft space-y-2">
          <div>
            <span className="font-extrabold text-ink">Quran content:</span>{' '}
            {source === 'quran-foundation-api' ? (
              <span className="text-brand-500 font-bold">Quran Foundation Content APIs (live)</span>
            ) : (
              <span className="text-ink">Bundled offline dataset</span>
            )}
          </div>
          <div>
            <span className="font-extrabold text-ink">Recitation check:</span>{' '}
            {aiStatus?.reachable ? (
              <span className="text-brand-500 font-bold">
                AI mode — faster-whisper sidecar
              </span>
            ) : aiStatus?.configured ? (
              <span className="text-accent-orange font-bold">
                Sidecar configured but unreachable — using Web Speech fallback
              </span>
            ) : (
              <span className="text-ink">
                Web Speech API + server-side Arabic similarity scoring
              </span>
            )}
          </div>
          <div className="text-xs text-ink-faint">
            User ID: <code>{api.userId()}</code>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 text-center">
      <div className="text-3xl font-extrabold text-ink">{value}</div>
      <div className="text-xs uppercase text-ink-soft font-bold">{label}</div>
      {sub && <div className="text-xs text-ink-faint mt-1">{sub}</div>}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 shadow-card">
      <div className="text-xs uppercase font-extrabold text-ink-faint mb-3">
        {title}
      </div>
      {children}
    </div>
  );
}
