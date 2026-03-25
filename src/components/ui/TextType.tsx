'use client';

import React, { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

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
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const timeoutRef = useRef<number | null>(null);
  const cursorRef = useRef<number | null>(null);
  const resetRef = useRef<number | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    if (resetRef.current) {
      window.clearTimeout(resetRef.current);
    }
    finishedRef.current = false;

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
