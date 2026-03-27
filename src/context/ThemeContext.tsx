'use client';

import React, { createContext, startTransition, useContext, useEffect, useState } from 'react';

import {
  defaultTheme,
  getThemeCssVariables,
  INTRO_STORAGE_KEY,
  isDarkTheme,
  isValidTheme,
  THEME_COOKIE_KEY,
  THEME_STORAGE_KEY,
  themeOptions,
  themes,
} from '@/lib/theme';
import { ThemeDefinition, ThemeType } from '@/lib/types';

interface ThemeContextType {
  theme: ThemeType;
  themeConfig: ThemeDefinition;
  availableThemes: ThemeDefinition[];
  isDark: boolean;
  showIntro: boolean;
  setTheme: (theme: ThemeType) => void;
  dismissIntro: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function resolveStoredTheme(initialTheme?: ThemeType) {
  if (initialTheme && themes[initialTheme]) return initialTheme;

  if (typeof document !== 'undefined') {
    const themedFromDom = document.documentElement.dataset.theme as ThemeType | undefined;
    if (themedFromDom && themes[themedFromDom]) return themedFromDom;
  }

  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeType | null;
    if (savedTheme && themes[savedTheme]) return savedTheme;
  }

  return defaultTheme;
}

function resolveIntroState() {
  if (typeof document !== 'undefined') {
    const introSeen = document.documentElement.dataset.introSeen;
    if (introSeen === 'true') return false;
    if (introSeen === 'false') return true;
  }

  if (typeof window !== 'undefined') {
    return localStorage.getItem(INTRO_STORAGE_KEY) !== 'true';
  }

  return false;
}

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: ThemeType;
}) {
  const [theme, setThemeState] = useState<ThemeType>(() => resolveStoredTheme(initialTheme));
  const [showIntro, setShowIntro] = useState(resolveIntroState);
  const themeConfig = themes[theme];

  const setTheme = (newTheme: ThemeType) => {
    if (!themes[newTheme]) return;

    startTransition(() => {
      setThemeState(newTheme);
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      document.cookie = `${THEME_COOKIE_KEY}=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const variables = getThemeCssVariables(themeConfig);

    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    root.dataset.theme = theme;
    root.dataset.themeMode = themeConfig.mode;
    root.style.colorScheme = themeConfig.mode;
    root.classList.toggle('dark', isDarkTheme(theme));
    body.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.cookie = `${THEME_COOKIE_KEY}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  }, [theme, themeConfig]);

  useEffect(() => {
    const domTheme = document.documentElement.dataset.theme;
    if (!isValidTheme(domTheme)) return;
    const frameId = window.requestAnimationFrame(() => {
      setThemeState((current) => (current === domTheme ? current : domTheme));
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  function dismissIntro() {
    setShowIntro(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(INTRO_STORAGE_KEY, 'true');
    }
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.introSeen = 'true';
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeConfig,
        availableThemes: themeOptions,
        isDark: isDarkTheme(theme),
        showIntro,
        setTheme,
        dismissIntro,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
