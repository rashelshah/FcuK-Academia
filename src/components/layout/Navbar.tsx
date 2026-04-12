'use client';

import React, { memo, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { BarChart2, Calendar, CheckSquare, Clock, Home, Settings, type LucideIcon } from 'lucide-react';

import { useTheme } from '@/context/ThemeContext';
import { getInteractiveMotion } from '@/lib/motion';
import type { ThemeMotionPreset } from '@/lib/types';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'home' },
  { href: '/marks', icon: BarChart2, label: 'marks' },
  { href: '/attendance', icon: CheckSquare, label: 'attendance' },
  { href: '/timetable', icon: Clock, label: 'timetable' },
  { href: '/calendar', icon: Calendar, label: 'calendar' },
  { href: '/settings', icon: Settings, label: 'settings' },
] as const;

const NAV_INSET_PX = 5;

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
  mounted: boolean;
  onNavigate?: (href: string) => void;
}

const NavItemButton = memo(function NavItemButton({
  href,
  icon: Icon,
  isActive,
  label,
  motionPreset,
  mounted,
  onNavigate,
}: NavItemButtonProps) {
  const motionProps = getInteractiveMotion(motionPreset);
  const content = (
    <div
      className={cn(
        'relative z-10 flex h-14 w-full items-center justify-center rounded-[999px] transition-colors duration-300',
        isActive ? 'text-[var(--text)]' : 'text-on-surface-variant',
      )}
      style={{
        WebkitTapHighlightColor: 'transparent',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      <span
        className={cn(
          'absolute inset-x-3 inset-y-[7px] rounded-[999px] transition-opacity duration-300',
          isActive ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 42%, rgba(255,255,255,0) 100%)',
        }}
      />
      <Icon
        size={20}
        strokeWidth={isActive ? 2.45 : 2.1}
        className="relative z-10 shrink-0 transition-transform duration-300 ease-out"
        style={{
          vectorEffect: 'non-scaling-stroke',
          shapeRendering: 'geometricPrecision',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitTransform: 'translateZ(0)',
          ...(isActive ? { filter: 'drop-shadow(0 0 12px color-mix(in srgb, var(--primary) 42%, transparent))' } : undefined),
        }}
      />
    </div>
  );

  const inner = mounted ? (
    <motion.div
      whileHover={motionProps.whileHover}
      whileTap={motionProps.whileTap}
      transition={motionProps.transition}
      className="relative w-full"
    >
      {content}
    </motion.div>
  ) : (
    <div className="relative w-full">
      {content}
    </div>
  );

  if (onNavigate) {
    return (
      <button
        type="button"
        aria-label={label}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => onNavigate(href)}
        className="relative flex min-w-0 items-center justify-center bg-transparent outline-none"
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
      className="relative flex min-w-0 items-center justify-center"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {inner}
    </Link>
  );
});

function Navbar({ activePath, onNavigate }: NavbarProps) {
  const pathname = usePathname();
  const { themeConfig } = useTheme();
  const [mounted, setMounted] = useState(false);
  const resolvedPath = activePath ?? (pathname.startsWith('/settings') ? '/settings' : pathname);
  const activeIndex = Math.max(0, navItems.findIndex((item) => item.href === resolvedPath));
  const indicatorLeft = `calc(${NAV_INSET_PX}px + ${activeIndex} * ((100% - ${NAV_INSET_PX * 2}px) / ${navItems.length}))`;
  const indicatorWidth = `calc((100% - ${NAV_INSET_PX * 2}px) / ${navItems.length})`;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <nav
      className="liquid-nav fixed bottom-4 left-1/2 z-50 w-[min(92%,28rem)] max-w-[28rem] -translate-x-1/2 sm:w-[min(92%,30rem)] sm:max-w-[30rem] lg:w-[min(88%,34rem)] lg:max-w-[34rem]"
      aria-label="Primary"
    >
      <svg aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
        <defs>
          <filter id="liquid-nav-glass" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.9" result="blurred" />
            <feColorMatrix
              in="blurred"
              type="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 18 -8
              "
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div
        className="relative overflow-hidden rounded-[34px] border p-[5px] backdrop-blur-[18px]"
        style={{
          borderColor: 'color-mix(in srgb, var(--border-strong) 62%, transparent)',
          background: 'linear-gradient(180deg, color-mix(in srgb, var(--nav-background) 92%, rgba(255,255,255,0.04)) 0%, color-mix(in srgb, var(--surface) 88%, transparent) 100%)',
          boxShadow: 'var(--elevation-nav)',
          paddingBottom: `calc(5px + max(env(safe-area-inset-bottom), 0px))`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{ background: 'var(--surface-gradient)' }}
        />
        <div
          className="pointer-events-none absolute inset-x-5 top-0 h-16 opacity-75 blur-2xl"
          style={{ background: 'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--primary) 24%, transparent), transparent 72%)' }}
        />

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[calc(5px+max(env(safe-area-inset-bottom),0px))] top-[5px]"
          animate={{ left: indicatorLeft }}
          initial={false}
          transition={{
            duration: 0.38,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            width: indicatorWidth,
            willChange: 'left, transform',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        >
          <div
            className="relative h-full w-full overflow-hidden border"
            style={{
              borderRadius: '26px',
              borderColor: 'color-mix(in srgb, var(--primary) 36%, rgba(255,255,255,0.28))',
              background: 'linear-gradient(180deg, color-mix(in srgb, rgba(255,255,255,0.26) 48%, var(--surface-highlight)) 0%, color-mix(in srgb, var(--primary) 10%, var(--surface-elevated) 90%) 100%)',
              boxShadow: '0 16px 32px rgba(0, 0, 0, 0.22), 0 0 24px color-mix(in srgb, var(--primary) 18%, transparent)',
              filter: 'url(#liquid-nav-glass)',
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 34%, rgba(255,255,255,0) 100%)',
              }}
            />
            <div
              className="absolute inset-[1px]"
              style={{
                borderRadius: '25px',
                background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary-soft) 22%, rgba(255,255,255,0.18)) 0%, color-mix(in srgb, var(--primary) 12%, transparent) 48%, rgba(255,255,255,0.04) 100%)',
              }}
            />
            <div
              className="absolute inset-x-4 top-1 h-4 rounded-full blur-lg"
              style={{ background: 'color-mix(in srgb, rgba(255,255,255,0.34) 75%, transparent)' }}
            />
            <div
              className="absolute inset-x-3 bottom-0 h-5 rounded-full blur-xl opacity-80"
              style={{ background: 'color-mix(in srgb, var(--primary) 26%, transparent)' }}
            />
          </div>
        </motion.div>

        <div className="relative grid grid-cols-6 items-center">
          {navItems.map((item) => (
            <NavItemButton
              key={item.href}
              href={item.href}
              icon={item.icon}
              isActive={resolvedPath === item.href}
              label={item.label}
              motionPreset={themeConfig.motion}
              mounted={mounted}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

export default memo(Navbar);
