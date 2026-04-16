'use client';

import React, { memo, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
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
        'relative z-10 flex h-[3.4rem] w-full items-center justify-center rounded-full transition-colors duration-300',
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
          size={17}
          strokeWidth={isActive ? 2.6 : 2.0}
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { themeConfig } = useTheme();
  const [mounted, setMounted] = useState(false);
  const resolvedPath = activePath ?? (pathname.startsWith('/settings') ? '/settings' : pathname);
  const activeIndex = Math.max(0, navItems.findIndex((item) => item.href === resolvedPath));
  const indicatorLeft = `calc(${NAV_INSET_PX}px + ${activeIndex} * ((100% - ${NAV_INSET_PX * 2}px) / ${navItems.length}))`;
  const indicatorWidth = `calc((100% - ${NAV_INSET_PX * 2}px) / ${navItems.length})`;

  // RMF Specific Navigation Setup
  // RMF Specific Navigation Setup
  const _isRmfRoute = pathname.startsWith('/rate-my-faculty');
  const [optimisticRmfRoute, setOptimisticRmfRoute] = useState(_isRmfRoute);

  useEffect(() => {
    setOptimisticRmfRoute(_isRmfRoute);
  }, [_isRmfRoute]);

  useEffect(() => {
    // Proactively prefetch the opposite route so transitions resolve immediately
    router.prefetch(optimisticRmfRoute ? '/' : '/rate-my-faculty');
  }, [optimisticRmfRoute, router]);

  const isRmfRoute = optimisticRmfRoute;
  // Instead of an early return, we will conditionally render the contents inside the main flex row
  // so the layout (left pill + right circle side-by-side) remains intact across the entire app.

  return (
    <>
      {/* Global Transition Mask */}
      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[45] pointer-events-none bg-[var(--background)]/80 flex flex-col items-center justify-center gap-6"
          >
            {/* Smooth glowing spinner */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[var(--primary)]/20 blur-xl animate-pulse" />
              <div className="w-12 h-12 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
            </div>
            
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)] animate-pulse">
              {!optimisticRmfRoute ? 'INITIALIZING FCUK...' : 'INITIALIZING RMF...'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex items-end justify-center px-4 sm:px-6 xl:px-8 mx-auto gap-4 sm:gap-6"
        style={{
          paddingBottom: `calc(16px + max(env(safe-area-inset-bottom), 0px))`,
        }}
      >
        {/* LEFT: FLOATING NAVBAR */}
      <AnimatePresence mode="wait">
        <motion.nav
          key={isRmfRoute ? 'rmf-nav' : 'main-nav'}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25, delay: 0.1 }}
          className={`liquid-nav pointer-events-auto relative ${isRmfRoute ? 'w-auto' : 'w-[85%] max-w-[28rem] sm:max-w-[32rem]'}`}
          aria-label={isRmfRoute ? 'RMF Navigation' : 'Primary'}
        >
          {isRmfRoute ? (
            <div className="bg-[var(--surface-elevated)]/80 backdrop-blur-3xl border border-white/10 p-1 rounded-full shadow-2xl flex items-center gap-0.5 sm:gap-1">
              {[
                { name: 'Feed', href: '/rate-my-faculty' },
                { name: 'Today', href: '/rate-my-faculty/today' },
                { name: 'Rooms', href: '/rate-my-faculty/rooms' },
                { name: 'RateMyFaculty', href: 'https://rate-my-facult.me', external: true },
              ].map((tab) => {
                const active = pathname === tab.href;
                return (
                  <button
                    key={tab.name}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'instant' });
                      if ('external' in tab && tab.external) {
                        window.open(tab.href, '_blank', 'noopener,noreferrer');
                      } else {
                        router.push(tab.href);
                      }
                    }}
                    className={cn(
                      "relative px-3 sm:px-6 py-2.5 rounded-full text-[10px] sm:text-xs font-bold tracking-widest transition-all outline-none",
                      active ? "text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="rmfLeftNavActive"
                        className="absolute inset-0 bg-[var(--surface-highlight)] shadow-sm rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center">
                      {tab.name === 'RateMyFaculty' ? (
                        <span className="font-serif italic font-black whitespace-nowrap">
                          <span className="hidden sm:inline">Rate<span className="text-[#C19F62]">My</span>Faculty</span>
                          <span className="sm:hidden">RMF</span>
                        </span>
                      ) : (
                        tab.name
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
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
                  className="relative h-10 w-10 overflow-hidden border backdrop-blur-md"
                  style={{
                    borderRadius: '50%',
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
          )}
        </motion.nav>
      </AnimatePresence>

      {/* RIGHT: FLOATING CTA BUTTON */}
        <div className="pointer-events-auto relative flex items-center justify-center">

          <button 
            type="button"
            onClick={() => {
              const targetURL = isRmfRoute ? "/" : "/rate-my-faculty";
              window.scrollTo({ top: 0, behavior: 'instant' });
              setOptimisticRmfRoute(!isRmfRoute); 
              startTransition(() => {
                router.push(targetURL);
              });
            }}
            className="outline-none"
          >
            <motion.div
              className="group relative flex aspect-square h-[4rem] items-center justify-center rounded-full outline-none"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
            >
              <div 
                className="absolute inset-0 rounded-full backdrop-blur-2xl transition-all duration-500 group-hover:duration-300"
                style={{
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, rgba(255,255,255,0.05)), color-mix(in srgb, var(--primary) 6%, rgba(255,255,255,0.02)))',
                  border: '1px solid color-mix(in srgb, var(--primary) 20%, rgba(255,255,255,0.12))',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 0 16px color-mix(in srgb, var(--primary) 8%, transparent)',
                }}
              />
              
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <AnimatePresence>
                  {isRmfRoute ? (
                    <motion.div
                      key="fcuk"
                      initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className={cn(
                        "absolute inset-0 flex flex-col items-center justify-center text-[13px] font-black tracking-widest uppercase leading-tight transition-colors duration-300",
                        "text-[var(--text)]",
                        themeConfig.mode === 'dark' && "drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                      )}
                    >
                      <span>FcuK</span>
                      <span className="text-[5.5px] tracking-[0.1em] opacity-80">Academia</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="rmf"
                      initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className={cn(
                        "absolute inset-0 flex items-center justify-center text-[14px] font-black tracking-widest uppercase transition-colors duration-300",
                        "text-[var(--text)]",
                        themeConfig.mode === 'dark' && "drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                      )}
                    >
                      RMF
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="absolute -top-10 scale-90 opacity-0 transition-all duration-300 group-hover:-top-12 group-hover:scale-100 group-hover:opacity-100 pointer-events-none whitespace-nowrap bg-[var(--surface-elevated)] backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-xs font-bold text-[var(--text)] uppercase tracking-widest">
                {isRmfRoute ? 'Return to FcuK' : 'Rate My Faculty'}
              </div>
            </motion.div>
          </button>
        </div>
    </div>
    </>
  );
}

export default memo(Navbar);
