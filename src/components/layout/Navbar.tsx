'use client';

import React, { memo, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
        'relative z-10 flex h-[3.8rem] w-full items-center justify-center rounded-full transition-colors duration-300',
        isActive ? 'text-[var(--text)]' : 'text-on-surface-variant opacity-50',
      )}
      style={{
        WebkitTapHighlightColor: 'transparent',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      <span
        className={cn(
          'absolute inset-y-[7px] aspect-square rounded-full transition-opacity duration-300',
          isActive ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 42%, rgba(255,255,255,0) 100%)',
        }}
      />
      <motion.div
        animate={{ scale: isActive ? 1.15 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Icon
          size={20}
          strokeWidth={isActive ? 2.4 : 2.0}
          className="relative z-10 shrink-0 transition-transform duration-300 ease-out"
          style={{
            vectorEffect: 'non-scaling-stroke',
            shapeRendering: 'geometricPrecision',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitTransform: 'translateZ(0)',
            ...(isActive ? { filter: 'drop-shadow(0 0 10px color-mix(in srgb, var(--primary) 60%, transparent))' } : undefined),
          }}
        />
      </motion.div>
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
    <div
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex items-end justify-between px-4 sm:px-6 xl:px-8 max-w-7xl mx-auto"
      style={{
        paddingBottom: `calc(16px + max(env(safe-area-inset-bottom), 0px))`,
      }}
    >
      {/* LEFT: FLOATING NAVBAR */}
      <AnimatePresence>
        <motion.nav
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 25, delay: 0.1 }}
          className="liquid-nav pointer-events-auto relative w-[85%] max-w-[28rem] sm:max-w-[32rem]"
          aria-label="Primary"
        >
          <div
            className="relative overflow-hidden rounded-full border p-[5px] backdrop-blur-xl"
            style={{
              borderColor: 'color-mix(in srgb, var(--border-strong) 40%, rgba(255,255,255,0.1))',
              background: 'linear-gradient(180deg, color-mix(in srgb, var(--nav-background) 80%, rgba(0,0,0,0.4)) 0%, color-mix(in srgb, var(--surface) 80%, rgba(0,0,0,0.6)) 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 16px rgba(255,255,255,0.02)',
              transform: 'translateZ(0)',
              willChange: 'transform',
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{ background: 'var(--surface-gradient)' }}
            />
            
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[5px] top-[5px] flex items-center justify-center"
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
                className="relative h-full aspect-square overflow-hidden border backdrop-blur-md"
                style={{
                  borderRadius: '999px',
                  borderColor: 'color-mix(in srgb, var(--primary) 36%, rgba(255,255,255,0.28))',
                  background: 'linear-gradient(180deg, color-mix(in srgb, rgba(255,255,255,0.26) 48%, var(--surface-highlight)) 0%, color-mix(in srgb, var(--primary) 10%, var(--surface-elevated) 90%) 100%)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2), 0 0 16px color-mix(in srgb, var(--primary) 40%, transparent)',
                  transform: 'translateZ(0)',
                }}
              >
                <div
                  className="absolute inset-[1px]"
                  style={{
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary-soft) 22%, rgba(255,255,255,0.18)) 0%, color-mix(in srgb, var(--primary) 12%, transparent) 48%, rgba(255,255,255,0.04) 100%)',
                  }}
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
        </motion.nav>
      </AnimatePresence>

      {/* RIGHT: FLOATING CTA BUTTON */}
      <AnimatePresence>
        <motion.div
           initial={{ scale: 0, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
           className="pointer-events-auto relative"
        >
          <Link href="/rate-my-faculty" passHref>
            <motion.div
              className="group flex aspect-square h-[4.2rem] sm:h-[4.5rem] items-center justify-center rounded-full outline-none"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
            >
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--primary)] via-[var(--primary-soft)] to-[color-mix(in_srgb,white_40%,var(--primary))] transition-all duration-300 group-hover:blur-md"
                style={{
                  boxShadow: '0 0 20px color-mix(in srgb, var(--primary) 60%, transparent), 0 8px 16px rgba(0,0,0,0.3)',
                }}
              />
              <div className="absolute inset-[1.5px] rounded-full bg-gradient-to-br from-[color-mix(in_srgb,var(--primary)_90%,white)] to-[color-mix(in_srgb,var(--primary)_80%,black)] flex items-center justify-center" />
              <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] pointer-events-none" />
              <span className="relative z-10 text-[13px] font-extrabold tracking-widest text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
                RMF
              </span>
              
              <div className="absolute -top-10 scale-90 opacity-0 transition-all duration-300 group-hover:-top-12 group-hover:scale-100 group-hover:opacity-100 pointer-events-none whitespace-nowrap bg-[var(--surface-elevated)] backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xl text-xs font-semibold text-[var(--text)]">
                Rate My Faculty
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default memo(Navbar);
