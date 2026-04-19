'use client';

import React, { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

// Global cache ensures strings are only typewritten ONCE per app session.
// Soft navigations within the SPA will bypass the animation and render instantly.
const typedStringsCache = new Set<string>();

interface TextTypeProps {
  text: string;
  className?: string;
  typingSpeed?: number;
  startDelay?: number;
  cursorCharacter?: string;
}

export default function TextType({
  text,
  className,
  typingSpeed = 42,
  startDelay = 60,
  cursorCharacter = '_',
}: TextTypeProps) {
  // Check memory synchronously to prevent 1-frame blank flashes during soft routing
  const isAlreadyTyped = typeof window !== 'undefined' && typedStringsCache.has(text);
  
  const [displayText, setDisplayText] = useState(isAlreadyTyped ? text : '');
  const [showCursor, setShowCursor] = useState(!isAlreadyTyped);
  const timeoutRef = useRef<number | null>(null);
  const cursorRef = useRef<number | null>(null);
  const resetRef = useRef<number | null>(null);
  const finishedRef = useRef(isAlreadyTyped);

  useEffect(() => {
    if (isAlreadyTyped) return; // Skip effects completely if cached

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    if (resetRef.current) window.clearTimeout(resetRef.current);
    
    finishedRef.current = false;
    typedStringsCache.add(text); // Register to memory instantly

    let index = 0;

    const typeNext = () => {
      if (index >= text.length) {
        finishedRef.current = true;
        setShowCursor(false);
        return;
      }

      index += 1;
      setDisplayText(text.slice(0, index));
      timeoutRef.current = window.setTimeout(typeNext, typingSpeed);
    };

    resetRef.current = window.setTimeout(() => {
      setDisplayText('');
      setShowCursor(true);
      timeoutRef.current = window.setTimeout(typeNext, startDelay);
    }, 0);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      if (resetRef.current) {
        window.clearTimeout(resetRef.current);
      }
    };
  }, [startDelay, text, typingSpeed]);

  useEffect(() => {
    cursorRef.current = window.setInterval(() => {
      if (finishedRef.current) {
        return;
      }
      setShowCursor((current) => !current);
    }, 480);

    return () => {
      if (cursorRef.current) {
        window.clearInterval(cursorRef.current);
      }
    };
  }, []);

  return (
    <span className={cn('block', className)}>
      {displayText}
      <span className="inline-block min-w-[0.5ch]">{showCursor ? cursorCharacter : ' '}</span>
    </span>
  );
}
