'use client';

import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart2,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  Settings,
  type LucideIcon,
} from 'lucide-react';

import { useTheme } from '@/context/ThemeContext';
import { useThemeDictionary } from '@/hooks/useThemeDictionary';
import { getInteractiveMotion } from '@/lib/motion';
import type { ThemeMotionPreset } from '@/lib/types';
import { cn } from '@/lib/utils';

// ─── Constants ─────────────────────────────────────────────────────────────────
/** Inner padding (px) between the nav pill edge and the item grid */
const NAV_INSET_PX = 5;
/** Total accumulated downward scroll (px) required to hide the nav */
const HIDE_DELTA_THRESHOLD = 60;
/** Any upward scroll ≥ this value (px) re-shows the nav */
const SHOW_DELTA_PX = 8;

const navItems = [
  { href: '/', icon: Home, label: 'home' },
  { href: '/marks', icon: BarChart2, label: 'marks' },
  { href: '/attendance', icon: CheckSquare, label: 'attendance' },
  { href: '/timetable', icon: Clock, label: 'timetable' },
  { href: '/calendar', icon: Calendar, label: 'calendar' },
  { href: '/settings', icon: Settings, label: 'settings' },
] as const;

const rmfNavItems = [
  { href: '/rate-my-faculty', label: 'Feed' },
  { href: '/rate-my-faculty/today', label: 'Today' },
  { href: '/rate-my-faculty/rooms', label: 'Rooms' },
  { href: 'https://rate-my-facult.me', label: 'RateMyFaculty', external: true },
] as const;

// ─── Haptic Feedback ───────────────────────────────────────────────────────────
// Capability-based detection — never UA-sniff
function triggerHaptic(pattern: number | number[] = 10) {
  if ('vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch { /* graceful degradation */ }
  }
}

// ─── Types ─────────────────────────────────────────────────────────────────────
interface NavbarProps {
  activePath?: string;
  onNavigate?: (href: string) => void;
}

interface NavItemButtonProps {
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  label: string;
  motionPreset: ThemeMotionPreset;
  themeId?: string;
  mounted: boolean;
  onNavigate?: (href: string) => void;
  onPointerDown?: () => void;
}

// ─── NavItemButton ──────────────────────────────────────────────────────────────
const NavItemButton = memo(function NavItemButton({
  href,
  icon: Icon,
  isActive,
  label,
  motionPreset,
  themeId,
  mounted,
  onNavigate,
  onPointerDown,
}: NavItemButtonProps) {
  const motionProps = getInteractiveMotion(motionPreset);

  const handlePointerDown = () => {
    // Arcade gets a distinct rattle pattern; everything else gets a subtle tap
    if (themeId === 'arcade') {
      triggerHaptic([10, 30, 10]);
    } else {
      triggerHaptic(10);
    }
    onPointerDown?.();
  };

  const content =
    themeId === 'arcade' ? (
      <div className="relative flex flex-col items-center justify-center w-full h-full pb-1">
        <div
          className={cn(
            'relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150',
            'active:translate-y-1 active:shadow-[inset_0_4px_0_rgba(255,255,255,0.2),0_0_15px_rgba(255,46,67,0.6)]',
            isActive ? 'bg-[#FF2E43] translate-y-1' : 'bg-[#222]',
          )}
          style={{
            boxShadow: isActive
              ? 'inset 0 4px 0 rgba(255,255,255,0.2), 0 0 15px rgba(255,46,67,0.6)'
              : 'inset 0 4px 0 rgba(255,255,255,0.1), 0 4px 0 #000',
            border: '2px solid #000',
          }}
        >
          <Icon
            size={18}
            strokeWidth={isActive ? 3 : 2.5}
            className={isActive ? 'text-white drop-shadow-md' : 'text-[#777]'}
          />
        </div>
      </div>
    ) : (
      <div
        className={cn(
          'relative z-10 flex flex-col h-full w-full items-center justify-center gap-1 py-1 px-0.5 rounded-full transition-colors duration-300',
          isActive ? 'text-[var(--primary)]' : 'text-on-surface-variant opacity-50 hover:opacity-80',
        )}
        style={{
          WebkitTapHighlightColor: 'transparent',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Mission-control rocket exhaust particle */}
        <AnimatePresence>
          {isActive && themeId === 'mission-control' && (
            <motion.div
              initial={{ opacity: 0.8, scaleY: 0.5, y: 0 }}
              animate={{ opacity: 0, scaleY: 2.5, y: 20 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute bottom-1 w-3 h-3 rounded-full bg-gradient-to-b from-[#00E5FF] to-transparent pointer-events-none"
              style={{ filter: 'blur(3px)', transformOrigin: 'top center' }}
            />
          )}
        </AnimatePresence>

        {/* Icon with subtle scale spring on active */}
        <motion.div
          animate={{ scale: isActive ? 1.22 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="relative z-10"
        >
          <Icon
            size={24}
            strokeWidth={isActive ? (href === '/marks' ? 2.4 : 1.9) : 1.5}
            fill={isActive && href !== '/marks' ? 'color-mix(in srgb, var(--primary) 35%, transparent)' : 'none'}
            className="relative z-10 shrink-0 transition-colors duration-200"
            style={{
              vectorEffect: 'non-scaling-stroke',
              shapeRendering: 'geometricPrecision',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
          />
        </motion.div>

        {/* Visible Page Label Under Icon */}
        <span
          className={cn(
            'relative z-10 text-[10px] sm:text-[11px] leading-none tracking-tight pt-0.5 transition-colors duration-200 capitalize font-semibold',
            isActive ? 'text-[var(--primary)] font-bold opacity-100' : 'text-on-surface-variant opacity-60',
          )}
        >
          {label}
        </span>
      </div>
    );

  const inner = mounted ? (
    <motion.div
      whileHover={motionProps.whileHover}
      whileTap={motionProps.whileTap}
      transition={motionProps.transition}
      className="relative w-full h-full"
    >
      {content}
    </motion.div>
  ) : (
    <div className="relative w-full h-full">{content}</div>
  );

  if (onNavigate) {
    return (
      <button
        type="button"
        aria-label={label}
        aria-current={isActive ? 'page' : undefined}
        onPointerDown={handlePointerDown}
        onClick={() => { onNavigate(href); }}
        className="relative flex h-full min-w-0 items-center justify-center bg-transparent outline-none"
        style={{
          WebkitTapHighlightColor: 'transparent',
          WebkitAppearance: 'none',
          appearance: 'none',
        }}
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      onPointerDown={handlePointerDown}
      className="relative flex h-full min-w-0 items-center justify-center"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {inner}
    </Link>
  );
});

// ─── RMF Floating Dock ─────────────────────────────────────────────────────────
interface RmfDockProps {
  isRmfRoute: boolean;
  themeMode: string;
  onToggle: () => void;
  collapsed: boolean;
  onExpand: () => void;
}

/**
 * Zepto-style utility dock floating above the navbar on the right.
 *
 * Collapsed State: Solid theme tab on right edge with ONLY the Left Chevron (‹).
 * Expanded State: Smoothly slides left to reveal the Logo icon.
 *
 * Tap when collapsed: smoothly expands / slides left.
 * Tap when expanded: navigates to destination (/rate-my-faculty or return home).
 */
const RmfDock = memo(function RmfDock({
  isRmfRoute,
  themeMode,
  onToggle,
  collapsed,
  onExpand,
}: RmfDockProps) {
  const logoSrc = isRmfRoute
    ? '/images/rmf/fcuk-logo.png'
    : themeMode === 'light'
    ? '/images/rmf/rmf-logo-light.png'
    : '/images/rmf/rmf-logo.png';

  const logoFilter = isRmfRoute
    ? themeMode === 'light'
      ? 'brightness(0) opacity(0.85)'
      : 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
    : themeMode === 'light'
    ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
    : 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))';

  const handleClick = () => {
    if (collapsed) {
      triggerHaptic(10);
      onExpand();
    } else {
      triggerHaptic(10);
      onToggle();
    }
  };

  return (
    <button
      type="button"
      onPointerDown={() => triggerHaptic(10)}
      onClick={handleClick}
      className="outline-none"
      aria-label={
        collapsed
          ? 'Expand dock'
          : isRmfRoute
          ? 'Return to FcuK Academia'
          : 'Open Rate My Faculty'
      }
      style={{ WebkitTapHighlightColor: 'transparent', display: 'block' }}
    >
      <motion.div
        layout
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'relative flex items-center justify-end overflow-hidden cursor-pointer rounded-l-2xl rounded-r-none',

        )}
        style={{
          height: '3.25rem',
          minHeight: '3.25rem',
          /* PART 2 — transformOrigin locks the right side; layout-animation
           * (width change) only grows toward the left. No right-edge movement. */
          transformOrigin: 'right center',
          /* Solid theme surface color — no transparent blur */
          background: isRmfRoute
            ? 'color-mix(in srgb, var(--primary) 18%, var(--surface-elevated))'
            : 'var(--surface-elevated)',
          border: isRmfRoute
            ? '1px solid color-mix(in srgb, var(--primary) 50%, transparent)'
            : '1px solid color-mix(in srgb, var(--border) 40%, rgba(255,255,255,0.15))',
          boxShadow: '0 3px 10px rgba(0,0,0,0.14)',
          transform: 'translateZ(0)',
        }}
      >
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut', delay: 0.05 }}
              className="absolute inset-0 pointer-events-none rounded-l-2xl rounded-r-none z-0"
            >
              <svg className="absolute top-0 left-0 h-full overflow-visible" style={{ width: 'calc(100% + 20px)' }}>
                <rect
                  x="1" y="1"
                  width="calc(100% - 2px)" height="calc(100% - 2px)"
                  rx="15"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  pathLength="100"
                  strokeDasharray="15 85"
                  className="rmf-svg-accent-path"
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout" initial={false}>
          {collapsed ? (
            <motion.div
              key="collapsed-chevron"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center w-12 h-full text-on-surface relative z-10 shrink-0"
            >
              <ChevronLeft size={24} strokeWidth={2.8} />
            </motion.div>
          ) : (
            <motion.div
              key="expanded-logo"
              initial={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center px-3.5 py-1 h-full relative z-10 shrink-0"
            >
              <img
                src={logoSrc}
                alt=""
                className="h-[2.5rem] w-[2.5rem] object-contain shrink-0"
                style={{ transform: 'translateZ(0)', filter: logoFilter }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
});

// ─── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ activePath, onNavigate }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { themeConfig } = useTheme();
  const { getTerm } = useThemeDictionary();
  const [mounted, setMounted] = useState(false);

  // ── Reduced Motion ────────────────────────────────────────────────────────
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Path resolution ────────────────────────────────────────────────────────
  const resolvedPath =
    activePath ?? (pathname.startsWith('/settings') ? '/settings' : pathname);

  // ── RMF navigation state ───────────────────────────────────────────────────
  const _isRmfRoute = pathname.startsWith('/rate-my-faculty');
  const [optimisticRmfRoute, setOptimisticRmfRoute] = useState(_isRmfRoute);
  const isRmfRoute = optimisticRmfRoute;
  const currentNavItems = isRmfRoute ? rmfNavItems : navItems;
  const currentActiveIndex = isRmfRoute
    ? Math.max(0, rmfNavItems.findIndex((item) => item.href === pathname))
    : Math.max(0, navItems.findIndex((item) => item.href === resolvedPath));

  // ── Pointer-down optimistic indicator ────────────────────────────────────
  // The indicator reacts on pointerdown — before the route changes.
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indicatorIndex = pressedIndex !== null ? pressedIndex : currentActiveIndex;

  const handleItemPointerDown = useCallback((index: number) => {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    setPressedIndex(index);
    // Safety: clear pressed state after 800ms in case route never resolves
    pressTimerRef.current = setTimeout(() => setPressedIndex(null), 800);
  }, []);

  // Clear pressed index when actual route resolves
  useEffect(() => {
    setPressedIndex(null);
  }, [currentActiveIndex]);

  // ── Nav inner width measurement (for translateX indicator) ─────────────
  // We measure the inner container so itemWidth stays accurate across breakpoints.
  const navInnerRef = useRef<HTMLDivElement>(null);
  const [itemWidth, setItemWidth] = useState(0);

  useEffect(() => {
    const el = navInnerRef.current;
    if (!el) return;
    const update = () => {
      setItemWidth((el.offsetWidth - 2 * NAV_INSET_PX) / currentNavItems.length);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [currentNavItems.length]);

  // ── Scroll-linked hide/show (accumulated delta) ────────────────────────
  const [navHidden, setNavHidden] = useState(false);
  const scrollYRef = useRef(0);
  const accRef = useRef(0);
  const tickRef = useRef(false);

  // ── RMF collapse state — persists across page navigations via useRef ───
  const rmfCollapsedRef = useRef(false);
  const [rmfCollapsed, setRmfCollapsed] = useState(false);
  const syncRmfCollapsed = useCallback((val: boolean) => {
    rmfCollapsedRef.current = val;
    setRmfCollapsed(val);
  }, []);

  useEffect(() => {
    const onScroll = (e: Event) => {
      // Do not respond during active swipe or programmatic navigation.
      if (document.body.classList.contains('is-swiping')) return;
      if (document.body.classList.contains('is-navigating')) return;
      if (tickRef.current) return;
      tickRef.current = true;

      requestAnimationFrame(() => {
        const target = (e.target as HTMLElement) || document.documentElement;
        const scrollTop =
          target === (document as any) || target === document.documentElement || target === document.body
            ? window.scrollY || document.documentElement.scrollTop
            : target.scrollTop || 0;

        const delta = scrollTop - scrollYRef.current;
        scrollYRef.current = scrollTop;

        if (delta > 0 && scrollTop > 15) {
          // Scrolling down — accumulate
          accRef.current = Math.min(accRef.current + delta, HIDE_DELTA_THRESHOLD + 20);
          if (accRef.current >= HIDE_DELTA_THRESHOLD) {
            setNavHidden(true);
            syncRmfCollapsed(true);
          }
        } else if (delta < -SHOW_DELTA_PX) {
          // Scrolling up — reset and show
          accRef.current = 0;
          setNavHidden(false);
          syncRmfCollapsed(false);
        }

        tickRef.current = false;
      });
    };

    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', onScroll, { capture: true });
  }, [syncRmfCollapsed]);

  // ── Post-swipe RMF collapse ────────────────────────────────────────────
  // Watch for the `is-swiping` body class to disappear after a swipe gesture.
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type !== 'attributes' || m.attributeName !== 'class') continue;
        const oldVal = m.oldValue ?? '';
        const wasSwipingClass = oldVal.includes('is-swiping');
        const isNowNotSwiping = !document.body.classList.contains('is-swiping');
        if (wasSwipingClass && isNowNotSwiping) {
          // Swipe settled — collapse the RMF dock
          syncRmfCollapsed(true);
        }
      }
    });
    observer.observe(document.body, { attributes: true, attributeOldValue: true });
    return () => observer.disconnect();
  }, [syncRmfCollapsed]);

  // ── External RMF nav toggle event ─────────────────────────────────────
  useEffect(() => {
    const handleToggle = (e: CustomEvent<{ isRmf: boolean }>) => {
      setOptimisticRmfRoute(e.detail.isRmf);
    };
    window.addEventListener('rmf-nav-toggle', handleToggle as EventListener);
    return () => window.removeEventListener('rmf-nav-toggle', handleToggle as EventListener);
  }, []);

  // ── Prefetch RMF routes ────────────────────────────────────────────────
  useEffect(() => {
    if (optimisticRmfRoute) {
      router.prefetch('/rate-my-faculty');
      router.prefetch('/rate-my-faculty/today');
      router.prefetch('/rate-my-faculty/rooms');
    }
  }, [optimisticRmfRoute, router]);

  useEffect(() => { setMounted(true); }, []);

  // ── Lock-in mode (hides nav on PYQ pages) ─────────────────────────────
  const isLockIn = pathname.startsWith('/pyqs');

  // ── RMF toggle handler ─────────────────────────────────────────────────
  const handleRmfToggle = useCallback(() => {
    const nextIsRmf = !optimisticRmfRoute;
    setOptimisticRmfRoute(nextIsRmf);

    // Reset scroll tracking so the top-scroll after navigation doesn't
    // misfire the scroll handler
    scrollYRef.current = 0;
    accRef.current = 0;

    if (nextIsRmf) {
      router.prefetch('/rate-my-faculty');
      router.prefetch('/rate-my-faculty/today');
      router.prefetch('/rate-my-faculty/rooms');
    } else {
      router.prefetch('/');
    }

    startTransition(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      router.push(nextIsRmf ? '/rate-my-faculty' : '/');
    });
  }, [optimisticRmfRoute, router, startTransition]);

  // ── Motion & Animation Config ──────────────────────────────────────────
  const hideY = 160;

  const navAnimate = isLockIn
    ? { y: prefersReducedMotion ? 0 : hideY, opacity: 0 }
    : navHidden
    ? {
        y: prefersReducedMotion ? 0 : hideY,
        opacity: prefersReducedMotion ? 0 : 1,
      }
    : { y: 0, opacity: 1 };

  const navTransition = isLockIn
    ? ({
        type: 'spring',
        stiffness: 260,
        damping: 32,
        mass: 1,
        restDelta: 0.001,
      } as const)
    : ({
        duration: 0.36,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      } as const);

  return (
    <>
      {/*
       * Outer fixed container for floating navigation system.
       * RMF Dock remains 100% visible on screen, collapsing to the right edge.
       * Navbar glides down off-screen on scroll down, restoring on scroll up.
       */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-stretch pointer-events-none"
        style={{
          paddingBottom: 'calc(16px + max(env(safe-area-inset-bottom, 0px), 0px))',
          '--nav-height': '5.0rem',
          '--nav-inset': `${NAV_INSET_PX}px`,
          /* PART 1 — Raised 14px above old position (26 → 40px) so it floats
           * comfortably above the navbar rather than feeling attached to it. */
          '--rmf-dock-offset': '40px',
        } as React.CSSProperties}
      >
        {/* ── RMF Floating Dock — stays on-screen, collapses to edge ── */}
        {!isLockIn && (
          <div
            className="flex justify-end items-center pointer-events-none"
            style={{
              marginBottom: 'var(--rmf-dock-offset, 40px)',
              /* PART 2 — Right edge is ALWAYS zero so the dock is permanently
               * flush with the right screen edge in both collapsed & expanded
               * states. Expansion only grows toward the left. */
              paddingRight: '0px',
              paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))',
            }}
          >
            {/* PART 3 — rmf-dock-expanded enables the CSS revolving accent border
             * only while expanded. Collapsed state remains completely clean. */}
            <div className={`pointer-events-auto${rmfCollapsed ? '' : ' rmf-dock-expanded'}`}>
              <RmfDock
                isRmfRoute={isRmfRoute}
                themeMode={themeConfig.mode}
                onToggle={handleRmfToggle}
                collapsed={rmfCollapsed}
                onExpand={() => syncRmfCollapsed(false)}
              />
            </div>
          </div>
        )}

        {/* ── Nav Bar — glides off-screen on scroll-down ────────────────────── */}
        <motion.div
          animate={navAnimate}
          transition={navTransition}
          className="flex items-center justify-center pointer-events-none"
          style={{
            paddingRight: 'max(16px, env(safe-area-inset-right, 0px))',
            paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))',
            willChange: 'transform, opacity',
          }}
        >
          <AnimatePresence mode="popLayout">
            <motion.nav
              key={isRmfRoute ? 'rmf-nav' : 'main-nav'}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              className="liquid-nav pointer-events-auto relative w-[95%] max-w-[38rem] sm:max-w-[42rem]"
              style={
                { height: 'var(--nav-height, 5.0rem)' } as React.CSSProperties
              }
              aria-label={isRmfRoute ? 'RMF Navigation' : 'Primary'}
            >
              <div
                ref={navInnerRef}
                className="relative h-full overflow-hidden rounded-full border p-1 px-1.5 sm:px-2"
                style={{
                  /* Solid Frosted glass material (88% surface opacity) */
                  backdropFilter: 'blur(14px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                  background:
                    'color-mix(in srgb, var(--surface) 88%, color-mix(in srgb, var(--primary) 8%, transparent))',
                  borderColor:
                    'color-mix(in srgb, white 22%, color-mix(in srgb, var(--primary) 12%, transparent))',
                  boxShadow:
                    '0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.12)',
                  transform: 'translateZ(0)',
                }}
              >
                {/* Surface gradient overlay (theme-specific tinting) */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-80"
                  style={{ background: 'var(--surface-gradient)' }}
                />

                {/* ── Nav Items Grid ──────────────────────────────────────── */}
                <div
                  className={cn(
                    'relative z-10 grid h-full items-center justify-items-center',
                    isRmfRoute ? 'grid-cols-4' : 'grid-cols-6',
                  )}
                >
                  {isRmfRoute
                    ? rmfNavItems.map((tab) => {
                        const active = pathname === tab.href;
                        return (
                          <button
                            key={tab.label}
                            onPointerDown={() => triggerHaptic(10)}
                            onClick={() => {
                              window.scrollTo({ top: 0, behavior: 'instant' });
                              if ('external' in tab && tab.external) {
                                window.open(tab.href, '_blank', 'noopener,noreferrer');
                              } else {
                                router.push(tab.href);
                              }
                            }}
                            className={cn(
                              'relative h-full w-full flex items-center justify-center rounded-full',
                              'text-[10px] sm:text-xs font-bold tracking-[0.1em] transition-colors duration-300',
                              active
                                ? 'text-[var(--text)]'
                                : 'text-on-surface-variant opacity-50 hover:opacity-80',
                            )}
                          >
                            <span className="relative z-10 flex items-center uppercase font-black">
                              {tab.label === 'RateMyFaculty' ? (
                                <span className="font-serif italic whitespace-nowrap">
                                  <span className="hidden sm:inline">
                                    Rate
                                    <span className="text-[#C19F62]">My</span>
                                    Faculty
                                  </span>
                                  <span className="sm:hidden">RMF</span>
                                </span>
                              ) : (
                                tab.label
                              )}
                            </span>
                          </button>
                        );
                      })
                    : navItems.map((item, index) => {
                        const displayLabel = getTerm(item.label) || item.label;
                        return (
                          <NavItemButton
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            isActive={resolvedPath === item.href}
                            label={displayLabel}
                            motionPreset={themeConfig.motion}
                            themeId={themeConfig.id}
                            mounted={mounted}
                            onNavigate={onNavigate}
                            onPointerDown={() => handleItemPointerDown(index)}
                          />
                        );
                      })}
                </div>
              </div>
            </motion.nav>
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}

export default memo(Navbar);
