'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Home, BarChart2, CheckSquare, Clock, Calendar, Settings } from 'lucide-react';

import { useTheme } from '@/context/ThemeContext';
import { getInteractiveMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'home' },
  { href: '/marks', icon: BarChart2, label: 'marks' },
  { href: '/attendance', icon: CheckSquare, label: 'attendance' },
  { href: '/timetable', icon: Clock, label: 'timetable' },
  { href: '/calendar', icon: Calendar, label: 'calendar' },
  { href: '/settings', icon: Settings, label: 'settings' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { themeConfig } = useTheme();
  const [mounted, setMounted] = useState(false);
  const motionProps = getInteractiveMotion(themeConfig.motion);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <nav
      className="fixed bottom-4 left-1/2 z-50 w-[min(92%,28rem)] max-w-[28rem] -translate-x-1/2 px-1 pb-[max(env(safe-area-inset-bottom),0px)] sm:w-[min(92%,30rem)] sm:max-w-[30rem] lg:w-[min(88%,34rem)] lg:max-w-[34rem]"
      aria-label="Primary"
    >
      <div
        className="relative overflow-hidden rounded-[var(--radius-pill)] border px-3 py-3 backdrop-blur-[16px]"
        style={{
          borderColor: 'var(--card-border)',
          background: 'var(--nav-background)',
          boxShadow: 'var(--elevation-nav)',
        }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: 'var(--surface-gradient)' }} />
        <div
          className="pointer-events-none absolute inset-x-10 -bottom-5 h-10 rounded-full blur-2xl"
          style={{
            background: 'radial-gradient(circle, color-mix(in srgb, var(--primary) 22%, transparent) 0%, color-mix(in srgb, var(--secondary) 12%, transparent) 42%, transparent 74%)',
          }}
        />

        <div className="relative grid grid-cols-6 items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const itemClassName = cn(
              'relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ease-out',
              isActive
                ? 'scale-110 text-primary'
                : 'scale-100 text-on-surface-variant',
            );

            const iconGlowClassName = cn(
              'absolute inset-0 rounded-full transition-all duration-300 ease-out',
              isActive
                ? 'shadow-[var(--glow-primary)]'
                : 'bg-transparent',
            );

            const iconHighlightClassName = cn(
              'absolute inset-[1px] rounded-full transition-opacity duration-300',
              isActive
                ? 'opacity-100'
                : 'opacity-0',
            );

            const iconClassName = cn(
              'relative z-10 transition-all duration-300 ease-out',
              isActive
                ? ''
                : 'drop-shadow-none',
            );

            const content = (
              <>
                <div
                  className={iconGlowClassName}
                  style={isActive ? { background: 'var(--hero-gradient)' } : undefined}
                />
                <div
                  className={iconHighlightClassName}
                  style={isActive ? { background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 48%, rgba(255,255,255,0) 100%)' } : undefined}
                />
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2.1}
                  className={iconClassName}
                  style={isActive ? { filter: 'drop-shadow(0 0 10px color-mix(in srgb, var(--primary) 64%, transparent))' } : undefined}
                />
              </>
            );

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="relative flex items-center justify-center"
              >
                {mounted ? (
                  <motion.div
                    whileHover={motionProps.whileHover}
                    whileTap={motionProps.whileTap}
                    transition={motionProps.transition}
                    className={itemClassName}
                  >
                    {content}
                  </motion.div>
                ) : (
                  <div className={itemClassName}>
                    {content}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
