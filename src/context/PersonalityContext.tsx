'use client';

import React, { createContext, useContext, useEffect, useState, startTransition } from 'react';
import { PersonalityMode } from '@/config/personality';
import { trackEvent } from '@/lib/analytics';
import { useUser } from '@/hooks/useUser';
import { FEATURES } from '@/lib/features';

const PERSONALITY_STORAGE_KEY = 'fcuk_personality_mode';

interface PersonalityContextType {
  mode: PersonalityMode;
  setMode: (newMode: PersonalityMode) => Promise<void>;
  isReady: boolean;
}

const PersonalityContext = createContext<PersonalityContextType | undefined>(undefined);

export function PersonalityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [mode, setModeState] = useState<PersonalityMode>('fcuk_academia');
  const [isReady, setIsReady] = useState(false);

  // Initialize from LocalStorage, then hydrate from User object if it exists
  useEffect(() => {
    if (!FEATURES.ENABLE_PERSONALITY_MODES) {
      setIsReady(true);
      return;
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(PERSONALITY_STORAGE_KEY) as PersonalityMode | null;
      if (stored) {
        setModeState(stored);
      }
    }
  }, []);

  // Hydrate from user object if loaded and different from current state
  useEffect(() => {
    if (!FEATURES.ENABLE_PERSONALITY_MODES) return;

    if (user && user.personalityMode) {
      const userMode = user.personalityMode as PersonalityMode;
      setModeState(userMode);
      if (typeof window !== 'undefined') {
        localStorage.setItem(PERSONALITY_STORAGE_KEY, userMode);
      }
    }
    setIsReady(true);
  }, [user]);

  const setMode = async (newMode: PersonalityMode) => {
    if (newMode === mode) return;

    startTransition(() => {
      setModeState(newMode);
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(PERSONALITY_STORAGE_KEY, newMode);
    }

    trackEvent('personality_mode_changed', { mode: newMode });

    if (user?.id) {
      try {
        await fetch('/api/user/personality', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ personalityMode: newMode }),
        });
      } catch (error) {
        console.error('Failed to sync personality mode', error);
      }
    }
  };

  return (
    <PersonalityContext.Provider value={{ mode, setMode, isReady }}>
      {children}
    </PersonalityContext.Provider>
  );
}

export function usePersonalityMode() {
  const context = useContext(PersonalityContext);
  if (context === undefined) {
    throw new Error('usePersonalityMode must be used within a PersonalityProvider');
  }
  return context;
}
