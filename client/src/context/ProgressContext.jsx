// Global progress state — XP, streak, hearts, etc. — fetched once on mount
// and refreshed after any mutation.

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api.js';

const ProgressCtx = createContext(null);

export function ProgressProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const data = await api.progress();
      setUser(data.user);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.progress();
        if (mounted) setUser(data.user);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Optimistic helpers that also call the API and refresh
  const setCharacter = async (character) => {
    setUser((u) => (u ? { ...u, character } : u));
    const data = await api.setCharacter(character);
    setUser(data.user);
  };

  const setPlacement = async (payload) => {
    const data = await api.setPlacement(payload);
    setUser(data.user);
  };

  const completeQuest = async (payload) => {
    const data = await api.completeQuest(payload);
    setUser(data.user);
    return data.user;
  };

  const toggleBookmark = async (verseKey) => {
    const data = await api.toggleBookmark(verseKey);
    setUser(data.user);
  };

  const toggleSavedWord = async (wordId) => {
    const data = await api.toggleSavedWord(wordId);
    setUser(data.user);
  };

  const clearMistake = async (questionId, ts) => {
    const data = await api.clearMistake(questionId, ts);
    setUser(data.user);
  };

  return (
    <ProgressCtx.Provider
      value={{
        user,
        loading,
        error,
        refresh,
        setCharacter,
        setPlacement,
        completeQuest,
        toggleBookmark,
        toggleSavedWord,
        clearMistake,
      }}
    >
      {children}
    </ProgressCtx.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressCtx);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
