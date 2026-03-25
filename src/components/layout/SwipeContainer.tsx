'use client';

import React, { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface SwipeScreen {
  href: string;
  Component: React.ComponentType;
}

interface SwipeContainerProps {
  activePath: string;
  screens: readonly SwipeScreen[];
  onNavigate: (href: string) => void;
}

const DIRECTION_LOCK_RATIO = 1.1;

function SwipeContainer({ activePath, screens, onNavigate }: SwipeContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const gestureLockRef = useRef<'x' | 'y' | null>(null);
  const activeIndexRef = useRef(0);
  const activePathRef = useRef(activePath);
  const [viewportWidth, setViewportWidth] = useState(0);

  const activeIndex = Math.max(0, screens.findIndex((screen) => screen.href === activePath));

  const toggleSwipeMode = useCallback((active: boolean) => {
    document.body.classList.toggle('is-swiping', active);
  }, []);

  useEffect(() => {
    activePathRef.current = activePath;
  }, [activePath]);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
      }
      toggleSwipeMode(false);
    };
  }, [toggleSwipeMode]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateWidth = () => {
      const nextWidth = node.clientWidth;
      setViewportWidth((current) => (current === nextWidth ? current : nextWidth));
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    activeIndexRef.current = activeIndex;
    const node = containerRef.current;
    if (!node) return;

    const targetLeft = node.clientWidth * activeIndex;
    if (Math.abs(node.scrollLeft - targetLeft) < 1) return;

    node.scrollTo({
      left: targetLeft,
      behavior: 'smooth',
    });
  }, [activeIndex]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const commitCurrentScreen = () => {
      const width = node.clientWidth || 1;
      const nextIndex = Math.max(0, Math.min(screens.length - 1, Math.round(node.scrollLeft / width)));
      const nextPath = screens[nextIndex]?.href;

      activeIndexRef.current = nextIndex;
      toggleSwipeMode(false);

      if (nextPath && nextPath !== activePathRef.current) {
        onNavigate(nextPath);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      gestureLockRef.current = null;
      touchStartXRef.current = touch.clientX;
      touchStartYRef.current = touch.clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartXRef.current;
      const deltaY = touch.clientY - touchStartYRef.current;

      if (!gestureLockRef.current) {
        if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;
        gestureLockRef.current = Math.abs(deltaX) > Math.abs(deltaY) * DIRECTION_LOCK_RATIO ? 'x' : 'y';
      }

      if (gestureLockRef.current === 'x') {
        toggleSwipeMode(true);
      }
    };

    const handleTouchEnd = () => {
      gestureLockRef.current = null;

      if (settleTimerRef.current === null) {
        window.setTimeout(() => {
          toggleSwipeMode(false);
        }, 120);
      }
    };

    const handleScroll = () => {
      toggleSwipeMode(true);

      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
      }

      settleTimerRef.current = window.setTimeout(() => {
        settleTimerRef.current = null;
        commitCurrentScreen();
      }, 90);
    };

    node.addEventListener('touchstart', handleTouchStart, { passive: true });
    node.addEventListener('touchmove', handleTouchMove, { passive: true });
    node.addEventListener('touchend', handleTouchEnd, { passive: true });
    node.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    node.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('touchmove', handleTouchMove);
      node.removeEventListener('touchend', handleTouchEnd);
      node.removeEventListener('touchcancel', handleTouchEnd);
      node.removeEventListener('scroll', handleScroll);

      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
    };
  }, [onNavigate, screens, toggleSwipeMode]);

  return (
    <main
      ref={containerRef}
      className="swipe-viewport relative flex h-[100dvh] min-h-[100dvh] snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
      style={{
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {screens.map(({ href, Component }) => (
        <section
          key={href}
          aria-hidden={href !== activePath}
          className={cn(
            'swipe-screen h-full min-w-full flex-[0_0_100%] snap-start overflow-y-auto overscroll-y-contain px-4 pt-6 sm:px-6 sm:pt-8',
            href !== activePath && 'pointer-events-none',
          )}
          style={{
            width: viewportWidth ? `${viewportWidth}px` : '100%',
            contain: 'layout paint size',
            transform: 'translateZ(0)',
          }}
        >
          <Component />
        </section>
      ))}
    </main>
  );
}

export default memo(SwipeContainer);
