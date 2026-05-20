import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ProgressProvider } from './context/ProgressContext.jsx';
import { Header } from './components/Header.jsx';
import { BottomNav } from './components/BottomNav.jsx';

import HomePage from './pages/HomePage.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import DiagnosticPage from './pages/DiagnosticPage.jsx';
import QuestPage from './pages/QuestPage.jsx';
import ListenPage from './pages/ListenPage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import StoryPage from './pages/StoryPage.jsx';
import ToolkitPage from './pages/ToolkitPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import TutorPage from './pages/TutorPage.jsx';
import ClassesPage from './pages/ClassesPage.jsx';
import ClassPage from './pages/ClassPage.jsx';
import CompassPage from './pages/CompassPage.jsx';
import CompassMissionPage from './pages/CompassMissionPage.jsx';

const FULLSCREEN_PREFIXES = ['/welcome', '/diagnostic', '/quest/', '/library/', '/tutor', '/classes/', '/compass/'];

function isFullscreen(pathname) {
  return FULLSCREEN_PREFIXES.some((p) =>
    p.endsWith('/') ? pathname.startsWith(p) : pathname === p || pathname.startsWith(p + '/')
  );
}

function Chrome({ children }) {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const fullscreen = isFullscreen(pathname);

  // Clean up ?auth=success / ?auth_error=... query params left by the
  // OAuth2 callback redirect, so they don't stick in the URL bar.
  useEffect(() => {
    const p = new URLSearchParams(search);
    if (p.has('auth') || p.has('auth_error')) {
      navigate(pathname, { replace: true });
    }
  }, [search, pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      {!fullscreen && <Header />}
      <main className="flex-1">{children}</main>
      {!fullscreen && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <Chrome>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/diagnostic" element={<DiagnosticPage />} />
          <Route path="/quest/:id" element={<QuestPage />} />
          <Route path="/listen" element={<ListenPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/:id" element={<StoryPage />} />
          <Route path="/toolkit" element={<ToolkitPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/tutor" element={<TutorPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/classes/:id" element={<ClassPage />} />
          <Route path="/compass" element={<CompassPage />} />
          <Route path="/compass/:id" element={<CompassMissionPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Chrome>
    </ProgressProvider>
  );
}
