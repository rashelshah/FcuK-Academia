'use client';

import React, { startTransition, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import HomePage from '@/app/page';
import AttendancePage from '@/app/attendance/page';
import CalendarPage from '@/app/calendar/page';
import MarksPage from '@/app/marks/page';
import SettingsPage from '@/app/settings/page';
import TimetablePage from '@/app/timetable/page';
import Navbar from '@/components/layout/Navbar';
import IntroOverlay from '@/components/ui/IntroOverlay';
import { cn } from '@/lib/utils';

const HIDE_NAV_PATHS = ['/login'];
const SWIPEABLE_PATHS = ['/', '/marks', '/attendance', '/timetable', '/calendar', '/settings'] as const;
const TAB_SCREENS = [
  { href: '/', Component: HomePage },
  { href: '/marks', Component: MarksPage },
  { href: '/attendance', Component: AttendancePage },
  { href: '/timetable', Component: TimetablePage },
  { href: '/calendar', Component: CalendarPage },
  { href: '/settings', Component: SettingsPage },
] as const;
const SWIPE_THRESHOLD_PX = 72;
const SWIPE_VELOCITY_THRESHOLD = 0.35;
const DIRECTION_LOCK_RATIO = 1.1;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const gestureLockRef = useRef<'x' | 'y' | null>(null);
  const dragOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const hideNav = HIDE_NAV_PATHS.includes(pathname);
  const isSwipeablePath = SWIPEABLE_PATHS.includes(pathname as typeof SWIPEABLE_PATHS[number]);
  const routePath = isSwipeablePath ? pathname as typeof SWIPEABLE_PATHS[number] : '/';
  const [optimisticPath, setOptimisticPath] = useState<typeof SWIPEABLE_PATHS[number] | null>(null);
  const activePath = optimisticPath ?? routePath;
  const activeTabIndex = SWIPEABLE_PATHS.indexOf(activePath);
  const isSwipeableRoute = activeTabIndex !== -1;

  useEffect(() => {
    SWIPEABLE_PATHS.forEach((path) => {
      router.prefetch(path);
    });
  }, [router]);

  useEffect(() => {
    if (!optimisticPath || optimisticPath !== routePath) return;

    const frame = window.requestAnimationFrame(() => {
      setOptimisticPath(null);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [optimisticPath, routePath]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateWidth = () => {
      setContainerWidth(node.clientWidth);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [isSwipeableRoute]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    dragOffsetRef.current = 0;
    if (!trackRef.current) return;
    trackRef.current.style.transition = 'transform 0.26s cubic-bezier(0.22, 1, 0.36, 1)';
    const offset = containerWidth ? -(activeTabIndex * containerWidth) : 0;
    trackRef.current.style.transform = `translate3d(${offset}px, 0, 0)`;
  }, [activeTabIndex, containerWidth]);

  if (hideNav) {
    return <>{children}</>;
  }

  function setTrackTransition(enabled: boolean) {
    if (!trackRef.current) return;
    trackRef.current.style.transition = enabled ? 'transform 0.26s cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
  }

  function applyTranslate(extraOffset = dragOffsetRef.current) {
    if (!trackRef.current) return;
    const offset = containerWidth ? -(activeTabIndex * containerWidth) + extraOffset : extraOffset;
    trackRef.current.style.transform = `translate3d(${offset}px, 0, 0)`;
  }

  function scheduleTranslate(extraOffset: number) {
    dragOffsetRef.current = extraOffset;
    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      applyTranslate();
      frameRef.current = null;
    });
  }

  function navigateToPath(nextPath: typeof SWIPEABLE_PATHS[number]) {
    if (!nextPath || nextPath === activePath) return;
    setOptimisticPath(nextPath);
    dragOffsetRef.current = 0;
    isDraggingRef.current = false;
    startTransition(() => {
      router.replace(nextPath, { scroll: false });
    });
  }

  function handleTouchStart(event: React.TouchEvent<HTMLElement>) {
    if (!isSwipeableRoute) return;
    const touch = event.touches[0];
    if (!touch) return;
    gestureLockRef.current = null;
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    touchStartTimeRef.current = performance.now();
    isDraggingRef.current = false;
  }

  function handleTouchMove(event: React.TouchEvent<HTMLElement>) {
    if (!isSwipeableRoute) return;

    const touch = event.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;
    if (!gestureLockRef.current) {
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;
      gestureLockRef.current = Math.abs(deltaX) > Math.abs(deltaY) * DIRECTION_LOCK_RATIO ? 'x' : 'y';
    }

    if (gestureLockRef.current !== 'x') return;

    const atFirstTab = activeTabIndex === 0 && deltaX > 0;
    const atLastTab = activeTabIndex === SWIPEABLE_PATHS.length - 1 && deltaX < 0;
    const resistedOffset = atFirstTab || atLastTab ? deltaX * 0.32 : deltaX;

    isDraggingRef.current = true;
    setTrackTransition(false);
    scheduleTranslate(resistedOffset);
    event.preventDefault();
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLElement>) {
    if (!isSwipeableRoute) return;
    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartXRef.current;
    const elapsed = Math.max(1, performance.now() - touchStartTimeRef.current);
    const velocityX = Math.abs(deltaX / elapsed);

    if (gestureLockRef.current === 'x' && (Math.abs(deltaX) > SWIPE_THRESHOLD_PX || velocityX > SWIPE_VELOCITY_THRESHOLD)) {
      const nextIndex = activeTabIndex + (deltaX < 0 ? 1 : -1);
      const nextPath = SWIPEABLE_PATHS[nextIndex];
      if (nextPath) {
        setTrackTransition(true);
        navigateToPath(nextPath);
      }
    } else if (gestureLockRef.current === 'x' && isDraggingRef.current) {
      setTrackTransition(true);
      scheduleTranslate(0);
    }

    gestureLockRef.current = null;
    isDraggingRef.current = false;
    dragOffsetRef.current = 0;
  }
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[28rem] overflow-x-hidden sm:max-w-[34rem] lg:max-w-[44rem] xl:max-w-[52rem]">
      <IntroOverlay />

      {isSwipeableRoute ? (
        <main
          ref={containerRef}
          className="relative h-[100dvh] min-h-[100dvh] overflow-hidden"
          style={{ touchAction: 'pan-y' }}
        >
          <div
            ref={trackRef}
            className="flex h-full will-change-transform"
            style={{ transform: 'translate3d(0, 0, 0)' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            {TAB_SCREENS.map(({ href, Component }) => (
              <section
                key={href}
                aria-hidden={href !== activePath}
                className={cn(
                  'h-full shrink-0 overflow-y-auto overscroll-y-contain touch-pan-y px-4 pt-6 sm:px-6 sm:pt-8',
                  href !== activePath && 'pointer-events-none',
                )}
                style={{ width: containerWidth ? `${containerWidth}px` : '100%' }}
              >
                <Component />
              </section>
            ))}
          </div>
        </main>
      ) : (
        <main className="px-4 pt-6 sm:px-6 sm:pt-8">
          {children}
        </main>
      )}

      <Navbar
        activePath={isSwipeableRoute ? activePath : pathname}
        onNavigate={isSwipeableRoute ? (href) => navigateToPath(href as typeof SWIPEABLE_PATHS[number]) : undefined}
      />
    </div>
  );
}
