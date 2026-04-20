'use client';

import React, { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { registerTabNavigationController, setActiveTabPath } from '@/components/layout/tab-navigation';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface SwipeScreen {
  href: string;
  Component: React.ComponentType;
}

interface SwipeContainerProps {
  activePath: string;
  screens: readonly SwipeScreen[];
  onNavigate: (href: string) => void;
  onPreviewPathChange?: (href: string) => void;
}

const DIRECTION_LOCK_RATIO = 1.2;
const NAV_TRANSITION_DURATION_MS = 280;

function SwipeContainer({ activePath, screens, onNavigate, onPreviewPathChange }: SwipeContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const navTimerRef = useRef<number | null>(null);
  const programmaticTargetIndexRef = useRef<number | null>(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const gestureLockRef = useRef<'x' | 'y' | null>(null);
  const navigationSourceRef = useRef<'nav' | 'swipe' | 'route' | null>(null);
  const activeIndexRef = useRef(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  const activeIndex = Math.max(0, screens.findIndex((screen) => screen.href === activePath));

  const toggleSwipeMode = useCallback((active: boolean) => {
    document.body.classList.toggle('is-swiping', active);
  }, []);

  const toggleNavigationMode = useCallback((active: boolean) => {
    document.body.classList.toggle('is-navigating', active);
  }, []);

  const clearNavigationMode = useCallback(() => {
    if (navTimerRef.current !== null) {
      window.clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }

    toggleNavigationMode(false);
  }, [toggleNavigationMode]);

  const scheduleNavigationModeReset = useCallback(() => {
    if (navTimerRef.current !== null) {
      window.clearTimeout(navTimerRef.current);
    }

    navTimerRef.current = window.setTimeout(() => {
      navTimerRef.current = null;
      toggleNavigationMode(false);
    }, NAV_TRANSITION_DURATION_MS);
  }, [toggleNavigationMode]);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
      }
      clearNavigationMode();
      toggleSwipeMode(false);
    };
  }, [clearNavigationMode, toggleSwipeMode]);

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
    const node = containerRef.current;
    if (!node) return;

    const targetLeft = node.clientWidth * activeIndex;
    const isAlreadySynced = activeIndexRef.current === activeIndex && Math.abs(node.scrollLeft - targetLeft) < 1;
    if (isAlreadySynced) return;

    programmaticTargetIndexRef.current = activeIndex;
    activeIndexRef.current = activeIndex;

    window.requestAnimationFrame(() => {
      node.scrollTo({
        left: targetLeft,
        behavior: 'auto',
      });
    });
  }, [activeIndex, viewportWidth]);

  useLayoutEffect(() => {
    registerTabNavigationController({
      navigateTo: (href, options) => {
        const node = containerRef.current;
        if (!node) return;

        const nextIndex = screens.findIndex((screen) => screen.href === href);
        if (nextIndex === -1) return;

        const width = node.clientWidth || viewportWidth || 1;
        const targetLeft = width * nextIndex;
        const isAlreadyActive = activeIndexRef.current === nextIndex && Math.abs(node.scrollLeft - targetLeft) < 1;

        if (isAlreadyActive) {
          clearNavigationMode();
          toggleSwipeMode(false);
          return;
        }

        if (settleTimerRef.current !== null) {
          window.clearTimeout(settleTimerRef.current);
          settleTimerRef.current = null;
        }

        programmaticTargetIndexRef.current = nextIndex;
        activeIndexRef.current = nextIndex;
        navigationSourceRef.current = options?.source ?? 'route';
        onPreviewPathChange?.(href);
        toggleSwipeMode(true);

        if (options?.source === 'nav' && !options.immediate) {
          toggleNavigationMode(true);
          scheduleNavigationModeReset();
        } else {
          clearNavigationMode();
        }

        window.requestAnimationFrame(() => {
          node.scrollTo({
            left: targetLeft,
            behavior: options?.immediate ? 'auto' : 'smooth',
          });
        });
      },
    });

    return () => {
      registerTabNavigationController(null);
    };
  }, [clearNavigationMode, onPreviewPathChange, scheduleNavigationModeReset, screens, toggleNavigationMode, toggleSwipeMode, viewportWidth]);

  const updatePreviewPath = useCallback((scrollLeft: number, viewport: number) => {
    const nextIndex = Math.max(0, Math.min(screens.length - 1, Math.round(scrollLeft / Math.max(viewport, 1))));
    const nextPath = screens[nextIndex]?.href;
    if (nextPath) {
      onPreviewPathChange?.(nextPath);
    }
  }, [onPreviewPathChange, screens]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const commitCurrentScreen = () => {
      const width = node.clientWidth || 1;
      const nextIndex = Math.max(0, Math.min(screens.length - 1, Math.round(node.scrollLeft / width)));
      const nextPath = screens[nextIndex]?.href;
      const programmaticTargetIndex = programmaticTargetIndexRef.current;
      const commitNavigation = () => {
        activeIndexRef.current = nextIndex;
        programmaticTargetIndexRef.current = null;
        toggleSwipeMode(false);
        clearNavigationMode();

        if (nextPath) {
          onPreviewPathChange?.(nextPath);
          if (navigationSourceRef.current === 'swipe' && nextPath !== activePath) {
            trackEvent('screen_swipe', {
              from: activePath,
              to: nextPath,
              navigation_surface: 'main_tabs',
            });
          }

          setActiveTabPath(nextPath);
          onNavigate(nextPath);
        }

        navigationSourceRef.current = null;
      };

      if (programmaticTargetIndex !== null) {
        const targetLeft = width * programmaticTargetIndex;
        const isNearTarget = Math.abs(node.scrollLeft - targetLeft) < 2;
        const hasReachedTargetScreen = nextIndex === programmaticTargetIndex;

        if (isNearTarget || hasReachedTargetScreen) {
          commitNavigation();
          return;
        }
      }

      commitNavigation();
    };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      clearNavigationMode();
      programmaticTargetIndexRef.current = null;
      gestureLockRef.current = null;
      navigationSourceRef.current = null;
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
        navigationSourceRef.current = 'swipe';
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
      updatePreviewPath(node.scrollLeft, node.clientWidth || viewportWidth || 1);

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
  }, [activePath, clearNavigationMode, onNavigate, onPreviewPathChange, screens, toggleSwipeMode, updatePreviewPath, viewportWidth]);

  useEffect(() => {
    onPreviewPathChange?.(activePath);
  }, [activePath, onPreviewPathChange]);

  return (
    <main
      ref={containerRef}
      className="swipe-viewport relative flex h-[100dvh] min-h-[100dvh] snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
      style={{
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        // pan-x: this container IS the horizontal scroller — the browser must
        // handle horizontal touch on the compositor thread (no JS blocking).
        // pan-y is passed to child screens so they can scroll vertically inside.
        touchAction: 'pan-x',
        // Prevent pull-to-refresh competing with horizontal swipe
        overscrollBehaviorX: 'none',
        overscrollBehaviorY: 'none',
      } as React.CSSProperties}
    >
      {screens.map(({ href, Component }) => {
        const isActive = href === activePath;
        return (
          <section
            key={href}
            aria-hidden={!isActive}
            className={cn(
              'swipe-screen h-full min-w-full flex-[0_0_100%] snap-start overflow-y-auto overscroll-y-contain px-4 pt-6 sm:px-6 sm:pt-8',
              !isActive && 'pointer-events-none',
            )}
            style={{
              width: viewportWidth ? `${viewportWidth}px` : '100%',
              // IMPORTANT: do NOT use content-visibility:auto here.
              // It collapses the section's height/width when off-screen,
              // breaking snap points and making scroll positions incorrect.
              // Instead use contain:layout paint for paint isolation only.
              contain: 'layout paint',
              // Promote each screen to GPU layer for smooth swipe tracking.
              // backface-visibility:hidden forces the browser to create
              // a separate compositing layer per screen without will-change.
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              // Allow vertical scroll inside each screen without
              // interfering with the parent's horizontal pan-x
              touchAction: 'pan-y',
            }}
          >
            <Component />
          </section>
        );
      })}
    </main>
  );
}

export default memo(SwipeContainer);
