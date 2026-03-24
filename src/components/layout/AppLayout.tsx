'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';

import Navbar from '@/components/layout/Navbar';

const HIDE_NAV_PATHS = ['/login'];
const SWIPEABLE_PATHS = ['/', '/marks', '/attendance', '/timetable', '/calendar'] as const;
const SWIPE_THRESHOLD = 72;
const SWIPE_VELOCITY_THRESHOLD = 0.35;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [navigationDirection, setNavigationDirection] = useState(0);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const hideNav = HIDE_NAV_PATHS.includes(pathname);
  const activeTabIndex = SWIPEABLE_PATHS.indexOf(pathname as typeof SWIPEABLE_PATHS[number]);
  const isSwipeableRoute = activeTabIndex !== -1;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (hideNav) {
    return <>{children}</>;
  }

  function navigateToDirection(swipeDirection: 1 | -1) {
    if (!isSwipeableRoute) return;
    const nextIndex = activeTabIndex + swipeDirection;
    const nextPath = SWIPEABLE_PATHS[nextIndex];

    if (!nextPath || nextPath === pathname) return;
    setNavigationDirection(swipeDirection);
    router.push(nextPath);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLElement>) {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    touchStartTimeRef.current = performance.now();
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLElement>) {
    if (!isSwipeableRoute) return;

    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;
    const elapsed = Math.max(1, performance.now() - touchStartTimeRef.current);
    const velocityX = Math.abs(deltaX / elapsed);

    if (Math.abs(deltaX) < SWIPE_THRESHOLD && velocityX < SWIPE_VELOCITY_THRESHOLD) return;
    if (Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;

    navigateToDirection(deltaX < 0 ? 1 : -1);
  }

  return (
    <div className="relative min-h-screen pb-40 max-w-md mx-auto overflow-x-hidden">
      {!mounted ? (
        <main className="px-4 sm:px-6 pt-6 sm:pt-8">
          {children}
        </main>
      ) : (
        <AnimatePresence mode="wait" initial={false} custom={navigationDirection}>
          <motion.main
            key={pathname}
            custom={navigationDirection}
            initial={{ opacity: 0, x: navigationDirection > 0 ? 28 : navigationDirection < 0 ? -28 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: navigationDirection > 0 ? -28 : navigationDirection < 0 ? 28 : 0 }}
            transition={{
              x: { type: 'spring', stiffness: 420, damping: 36, mass: 0.8 },
              opacity: { duration: 0.18, ease: 'easeOut' },
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="min-h-[calc(100dvh-9.5rem)] px-4 sm:px-6 pt-6 sm:pt-8 touch-pan-y will-change-transform"
            style={{ touchAction: 'pan-y' }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      )}
      <Navbar />
    </div>
  );
}
