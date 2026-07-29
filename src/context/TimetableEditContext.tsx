'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { RawTimetableItem } from '@/lib/server/academia';

type RawClassItem = RawTimetableItem['class'][number];

export interface HiddenLecture {
  id: string; // e.g. dayOrder-slot-courseCode
  title: string;
}

interface TimetableEditContextType {
  isEditMode: boolean;
  hiddenLectureIds: string[];
  hiddenLectures: HiddenLecture[];
  toggleEditMode: () => void;
  setEditMode: (mode: boolean) => void;
  hideLecture: (id: string, title: string) => void;
  restoreLecture: (id: string) => void;
  restoreAll: () => void;
}

const TimetableEditContext = createContext<TimetableEditContextType | undefined>(undefined);

export function TimetableEditProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Array of hidden lecture IDs
  const [hiddenLectureIds, setHiddenLectureIds] = useState<string[]>([]);
  // We also keep track of their titles to display in the "Hidden Lectures" list
  const [hiddenLectures, setHiddenLectures] = useState<HiddenLecture[]>([]);
  
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fcuk_hiddenLectures');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHiddenLectures(parsed);
          setHiddenLectureIds(parsed.map(p => p.id));
        }
      } catch (e) {
        console.error('Failed to parse hidden lectures', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when hiddenLectures changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fcuk_hiddenLectures', JSON.stringify(hiddenLectures));
      setHiddenLectureIds(hiddenLectures.map(l => l.id));
    }
  }, [hiddenLectures, isLoaded]);

  // Auto-exit edit mode when user switches tabs/leaves window
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isEditMode) {
        setIsEditMode(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isEditMode]);

  // Auto exit when unmounting
  useEffect(() => {
    return () => {
      setIsEditMode(false);
    };
  }, []);

  const toggleEditMode = useCallback(() => setIsEditMode(prev => !prev), []);
  const setEditMode = useCallback((mode: boolean) => setIsEditMode(mode), []);

  const hideLecture = useCallback((id: string, title: string) => {
    setHiddenLectures(prev => {
      if (prev.find(l => l.id === id)) return prev;
      return [...prev, { id, title }];
    });
  }, []);

  const restoreLecture = useCallback((id: string) => {
    setHiddenLectures(prev => prev.filter(l => l.id !== id));
  }, []);

  const restoreAll = useCallback(() => {
    setHiddenLectures([]);
  }, []);

  return (
    <TimetableEditContext.Provider
      value={{
        isEditMode,
        hiddenLectureIds,
        hiddenLectures,
        toggleEditMode,
        setEditMode,
        hideLecture,
        restoreLecture,
        restoreAll,
      }}
    >
      {children}
    </TimetableEditContext.Provider>
  );
}

export function useTimetableEdit() {
  const context = useContext(TimetableEditContext);
  if (context === undefined) {
    throw new Error('useTimetableEdit must be used within a TimetableEditProvider');
  }
  return context;
}

export function generateLectureId(dayOrder: number, item: RawClassItem, index: number) {
  // Using dayOrder + slot + courseCode/title + index for uniqueness
  const code = item.courseCode || item.courseTitle || item.time;
  return `${dayOrder}-${item.slot}-${code}-${index}`.replace(/\s+/g, '-').toLowerCase();
}
