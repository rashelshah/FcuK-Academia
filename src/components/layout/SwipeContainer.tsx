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

const SWIPE_THRESHOLD_PX = 72;
const SWIPE_VELOCITY_THRESHOLD = 0.35;
const DIRECTION_LOCK_RATIO = 1.1;

function SwipeContainer({ activePath, screens, onNavigate }: SwipeContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const gestureLockRef = useRef<'x' | 'y' | null>(null);
  const dragOffsetRef = useRef(0);
  const activeIndexRef = useRef(0);
  const containerWidthRef = useRef(0);
  const isDraggingRef = useRef(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const activeIndex = Math.max(0, screens.findIndex((screen) => screen.href === activePath));

  const toggleSwipeMode = useCallback((active: boolean) => {
    document.body.classList.toggle('is-swiping', active);
  }, []);

  const setTrackTransition = useCallback((enabled: boolean) => {
    if (!trackRef.current) return;
    trackRef.current.style.transition = enabled ? 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
  }, []);

  const applyTranslate = useCallback((index = activeIndexRef.current, extraOffset = dragOffsetRef.current) => {
    if (!trackRef.current) return;
    const width = containerWidthRef.current;
    const offset = width ? -(index * width) + extraOffset : extraOffset;
    trackRef.current.style.transform = `translate3d(${offset}px, 0, 0)`;
  }, []);

  const scheduleTranslate = useCallback((index = activeIndexRef.current, extraOffset = dragOffsetRef.current) => {
    dragOffsetRef.current = extraOffset;

    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      applyTranslate(index, dragOffsetRef.current);
      frameRef.current = null;
    });
  }, [applyTranslate]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      toggleSwipeMode(false);
    };
  }, [toggleSwipeMode]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateWidth = () => {
      const nextWidth = node.clientWidth;
      containerWidthRef.current = nextWidth;
      setContainerWidth((current) => (current === nextWidth ? current : nextWidth));
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
    dragOffsetRef.current = 0;
    setTrackTransition(true);
    applyTranslate(activeIndex, 0);
  }, [activeIndex, applyTranslate, setTrackTransition]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      gestureLockRef.current = null;
      isDraggingRef.current = false;
      touchStartXRef.current = touch.clientX;
      touchStartYRef.current = touch.clientY;
      touchStartTimeRef.current = performance.now();
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartXRef.current;
      const deltaY = touch.clientY - touchStartYRef.current;

      if (!gestureLockRef.current) {
        if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;
        gestureLockRef.current = Math.abs(deltaX) > Math.abs(deltaY) * DIRECTION_LOCK_RATIO ? 'x' : 'y';
        if (gestureLockRef.current === 'x') {
          toggleSwipeMode(true);
        }
      }

      if (gestureLockRef.current !== 'x') return;

      const atFirstTab = activeIndexRef.current === 0 && deltaX > 0;
      const atLastTab = activeIndexRef.current === screens.length - 1 && deltaX < 0;
      const resistedOffset = atFirstTab || atLastTab ? deltaX * 0.32 : deltaX;

      isDraggingRef.current = true;
      setTrackTransition(false);
      scheduleTranslate(activeIndexRef.current, resistedOffset);
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartXRef.current;
      const elapsed = Math.max(1, performance.now() - touchStartTimeRef.current);
      const velocityX = Math.abs(deltaX / elapsed);

      if (gestureLockRef.current === 'x' && (Math.abs(deltaX) > SWIPE_THRESHOLD_PX || velocityX > SWIPE_VELOCITY_THRESHOLD)) {
        const nextIndex = activeIndexRef.current + (deltaX < 0 ? 1 : -1);
        const nextScreen = screens[nextIndex];

        if (nextScreen) {
          activeIndexRef.current = nextIndex;
          setTrackTransition(true);
          applyTranslate(nextIndex, 0);
          onNavigate(nextScreen.href);
        } else {
          setTrackTransition(true);
          scheduleTranslate(activeIndexRef.current, 0);
        }
      } else if (gestureLockRef.current === 'x' && isDraggingRef.current) {
        setTrackTransition(true);
        scheduleTranslate(activeIndexRef.current, 0);
      }

      gestureLockRef.current = null;
      isDraggingRef.current = false;
      dragOffsetRef.current = 0;
      toggleSwipeMode(false);
    };

    node.addEventListener('touchstart', handleTouchStart, { passive: true });
    node.addEventListener('touchmove', handleTouchMove, { passive: true });
    node.addEventListener('touchend', handleTouchEnd, { passive: true });
    node.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('touchmove', handleTouchMove);
      node.removeEventListener('touchend', handleTouchEnd);
      node.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [applyTranslate, onNavigate, scheduleTranslate, screens, setTrackTransition, toggleSwipeMode]);

  return (
    <main
      ref={containerRef}
      className="relative h-[100dvh] min-h-[100dvh] overflow-hidden"
      style={{ touchAction: 'pan-y' }}
    >
      <div
        ref={trackRef}
        className="swipe-track flex h-full will-change-transform"
        style={{ transform: 'translate3d(0, 0, 0)' }}
      >
        {screens.map(({ href, Component }) => (
          <section
            key={href}
            aria-hidden={href !== activePath}
            className={cn(
              'swipe-screen h-full shrink-0 overflow-y-auto overscroll-y-contain touch-pan-y px-4 pt-6 sm:px-6 sm:pt-8',
              href !== activePath && 'pointer-events-none',
            )}
            style={{
              width: containerWidth ? `${containerWidth}px` : '100%',
              contain: 'layout paint size',
              transform: 'translateZ(0)',
            }}
          >
            <Component />
          </section>
        ))}
      </div>
    </main>
  );
}

export default memo(SwipeContainer);
