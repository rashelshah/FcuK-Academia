'use client';

import React, { memo, startTransition, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const RmfAnnouncementPopup = dynamic(() => import('@/components/system/RmfAnnouncementPopup'), { ssr: false });

import HomePage from '@/app/page';
import AttendancePage from '@/app/attendance/page';
import CalendarPage from '@/app/calendar/page';
import MarksPage from '@/app/marks/page';
import SettingsPage from '@/app/settings/page';
import TimetablePage from '@/app/timetable/page';
import Navbar from '@/components/layout/Navbar';
import SwipeContainer from '@/components/layout/SwipeContainer';
import OnboardingOverlay from '@/components/onboarding/OnboardingOverlay';
import { navigateToTab, syncRouteTabPath, useActiveTabPath } from '@/components/layout/tab-navigation';
import IntroOverlay from '@/components/ui/IntroOverlay';
import CinematicIntroOverlay from '@/components/ui/CinematicIntroOverlay';
import InstallGate from '@/components/system/InstallGate';
import GlobalErrorBanner from '@/components/ui/GlobalErrorBanner';
import ThemeBackground from '@/components/themes/ThemeBackground';
import { useTheme } from '@/context/ThemeContext';
import ThemeAnnouncementBanner from '@/components/ui/ThemeAnnouncementBanner';

const HIDE_NAV_PATHS = ['/login'];
const SWIPEABLE_PATHS = ['/', '/marks', '/attendance', '/timetable', '/calendar', '/settings'] as const;
const MemoHomePage = memo(HomePage);
const MemoMarksPage = memo(MarksPage);
const MemoAttendancePage = memo(AttendancePage);
const MemoTimetablePage = memo(TimetablePage);
const MemoCalendarPage = memo(CalendarPage);
const MemoSettingsPage = memo(SettingsPage);
const TAB_SCREENS = [
  { href: '/', Component: MemoHomePage },
  { href: '/marks', Component: MemoMarksPage },
  { href: '/attendance', Component: MemoAttendancePage },
  { href: '/timetable', Component: MemoTimetablePage },
  { href: '/calendar', Component: MemoCalendarPage },
  { href: '/settings', Component: MemoSettingsPage },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { themeConfig } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const activeTabPath = useActiveTabPath();
  const [swipePreviewPath, setSwipePreviewPath] = useState<string | null>(null);
  const hideNav = HIDE_NAV_PATHS.includes(pathname);
  const isSwipeablePath = SWIPEABLE_PATHS.includes(pathname as typeof SWIPEABLE_PATHS[number]);
  const routePath = isSwipeablePath ? pathname as typeof SWIPEABLE_PATHS[number] : null;
  const swipeActivePath = routePath && SWIPEABLE_PATHS.includes(activeTabPath as typeof SWIPEABLE_PATHS[number])
    ? activeTabPath as typeof SWIPEABLE_PATHS[number]
    : routePath ?? SWIPEABLE_PATHS[0];
  const isSwipeableRoute = routePath !== null;
  const navActivePath = pathname.startsWith('/settings') ? '/settings' : pathname;

  useEffect(() => {
    // 1. Staggered prefetching using idle callback to prioritize interactivity (INP fix)
    const startIdleTasks = () => {
      const idleCallback = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 2000));
      
      idleCallback(() => {
        SWIPEABLE_PATHS.forEach((path) => {
          router.prefetch(path);
        });

        // 2. Proactive Cache Warming for RMF (staggered slightly more)
        setTimeout(async () => {
          try {
            router.prefetch('/rate-my-faculty');
            await fetch('/api/rmf/faculty', { priority: 'low' } as any);
          } catch (e) {
            // Silently fail
          }
        }, 1000);
      });
    };

    const timer = setTimeout(startIdleTasks, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    if (!routePath) return;
    syncRouteTabPath(routePath);
  }, [routePath]);

  const navigateToPath = useCallback((nextPath: typeof SWIPEABLE_PATHS[number]) => {
    if (!nextPath || nextPath === pathname) return;
    startTransition(() => {
      router.replace(nextPath, { scroll: false });
    });
  }, [pathname, router]);

  const handleSwipeNavigate = useCallback((href: string) => {
    if (SWIPEABLE_PATHS.includes(href as typeof SWIPEABLE_PATHS[number])) {
      navigateToPath(href as typeof SWIPEABLE_PATHS[number]);
    }
  }, [navigateToPath]);

  const handleNavbarNavigate = useCallback((href: string) => {
    if (SWIPEABLE_PATHS.includes(href as typeof SWIPEABLE_PATHS[number])) {
      navigateToTab(href as typeof SWIPEABLE_PATHS[number], { source: 'nav' });
    }
  }, []);

  if (hideNav) {
    return <>{children}</>;
  }

  const navbarActivePath = isSwipeableRoute
    ? (swipePreviewPath && swipePreviewPath !== routePath ? swipePreviewPath : swipeActivePath)
    : navActivePath;

  return (
    <InstallGate>
      <ThemeBackground theme={themeConfig.id} />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[28rem] overflow-x-hidden sm:max-w-[34rem] lg:max-w-[44rem] xl:max-w-[52rem]">
        {/* iOS-like status bar background padding */}
        <div className="h-safe-top bg-surface" />
        <div className="sticky top-0 z-50">
          <GlobalErrorBanner />
          <ThemeAnnouncementBanner />
        </div>
        <IntroOverlay />
        <CinematicIntroOverlay />
        <OnboardingOverlay />

        <div className="app-shell z-10 transition-opacity duration-300">
          {isSwipeableRoute ? (
            <SwipeContainer
              activePath={swipeActivePath}
              screens={TAB_SCREENS}
              onNavigate={handleSwipeNavigate}
              onPreviewPathChange={setSwipePreviewPath}
            />
          ) : (
            <main className="px-4 pt-6 sm:px-6 sm:pt-8">
              {children}
            </main>
          )}

          <RmfAnnouncementPopup />
          <Navbar
            activePath={navbarActivePath}
            onNavigate={isSwipeableRoute ? handleNavbarNavigate : undefined}
          />
        </div>
      </div>
    </InstallGate>
  );
}
