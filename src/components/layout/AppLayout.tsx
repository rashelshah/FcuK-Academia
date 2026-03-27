'use client';

import React, { memo, startTransition, useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import HomePage from '@/app/page';
import AttendancePage from '@/app/attendance/page';
import CalendarPage from '@/app/calendar/page';
import MarksPage from '@/app/marks/page';
import SettingsPage from '@/app/settings/page';
import TimetablePage from '@/app/timetable/page';
import Navbar from '@/components/layout/Navbar';
import SwipeContainer from '@/components/layout/SwipeContainer';
import { navigateToTab, syncRouteTabPath, useActiveTabPath } from '@/components/layout/tab-navigation';
import IntroOverlay from '@/components/ui/IntroOverlay';

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
  const pathname = usePathname();
  const router = useRouter();
  const activeTabPath = useActiveTabPath();
  const hideNav = HIDE_NAV_PATHS.includes(pathname);
  const isSwipeablePath = SWIPEABLE_PATHS.includes(pathname as typeof SWIPEABLE_PATHS[number]);
  const routePath = isSwipeablePath ? pathname as typeof SWIPEABLE_PATHS[number] : null;
  const swipeActivePath = routePath && SWIPEABLE_PATHS.includes(activeTabPath as typeof SWIPEABLE_PATHS[number])
    ? activeTabPath as typeof SWIPEABLE_PATHS[number]
    : routePath ?? SWIPEABLE_PATHS[0];
  const isSwipeableRoute = routePath !== null;
  const navActivePath = pathname.startsWith('/settings') ? '/settings' : pathname;

  useEffect(() => {
    SWIPEABLE_PATHS.forEach((path) => {
      router.prefetch(path);
    });
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
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[28rem] overflow-x-hidden sm:max-w-[34rem] lg:max-w-[44rem] xl:max-w-[52rem]">
      <IntroOverlay />

      <div className="app-shell transition-opacity duration-300">
        {isSwipeableRoute ? (
          <SwipeContainer activePath={swipeActivePath} screens={TAB_SCREENS} onNavigate={handleSwipeNavigate} />
        ) : (
          <main className="px-4 pt-6 sm:px-6 sm:pt-8">
            {children}
          </main>
        )}

        <Navbar
          activePath={isSwipeableRoute ? swipeActivePath : navActivePath}
          onNavigate={isSwipeableRoute ? handleNavbarNavigate : undefined}
        />
      </div>
    </div>
  );
}
