'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const SPLASH_SESSION_KEY = 'hasSeenSplash';
const ENTRY_DURATION_MS = 700;
const EXIT_DURATION_MS = 180;

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (sessionStorage.getItem(SPLASH_SESSION_KEY)) {
      return;
    }

    sessionStorage.setItem(SPLASH_SESSION_KEY, 'true');
    const showTimer = window.setTimeout(() => {
      setIsVisible(true);
    }, 0);

    const exitTimer = window.setTimeout(() => {
      setIsAnimatingOut(true);
    }, ENTRY_DURATION_MS);

    const unmountTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, ENTRY_DURATION_MS + EXIT_DURATION_MS);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(unmountTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className={`splash-screen${isAnimatingOut ? ' splash-screen--exit' : ''}`}
    >
      <div className="splash-screen__logo-wrap">
        <Image
          src="/android-chrome-512x512.png"
          alt=""
          width={112}
          height={112}
          priority
          sizes="112px"
          className="splash-screen__logo"
        />
      </div>
    </div>
  );
}
