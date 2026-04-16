'use client';

import React, { memo, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart2, Calendar, CheckSquare, Clock, Home, Settings, type LucideIcon } from 'lucide-react';

import { useTheme } from '@/context/ThemeContext';
import { useAppState } from '@/context/AppStateContext';
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

const rmfNavItems = [
  { href: '/rate-my-faculty', label: 'Feed' },
  { href: '/rate-my-faculty/today', label: 'Today' },
  { href: '/rate-my-faculty/rooms', label: 'Rooms' },
  { href: 'https://rate-my-facult.me', label: 'RateMyFaculty', external: true },
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
  const { isAnnouncementActive } = useAppState();
  const [mounted, setMounted] = useState(false);
  const resolvedPath = activePath ?? (pathname.startsWith('/settings') ? '/settings' : pathname);
  
  // Navigation State Logic
  const _isRmfRoute = pathname.startsWith('/rate-my-faculty');
  const [optimisticRmfRoute, setOptimisticRmfRoute] = useState(_isRmfRoute);
  
  const isRmfRoute = optimisticRmfRoute;
  const currentNavItems = isRmfRoute ? rmfNavItems : navItems;
  const currentActiveIndex = isRmfRoute 
    ? Math.max(0, rmfNavItems.findIndex((item) => item.href === pathname))
    : Math.max(0, navItems.findIndex((item) => item.href === resolvedPath));
  
  const currentIndicatorLeft = `calc(${NAV_INSET_PX}px + ${currentActiveIndex} * ((100% - ${NAV_INSET_PX * 2}px) / ${currentNavItems.length}))`;
  const currentIndicatorWidth = `calc((100% - ${NAV_INSET_PX * 2}px) / ${currentNavItems.length})`;

  useEffect(() => {
    setOptimisticRmfRoute(_isRmfRoute);
  }, [_isRmfRoute]);

  useEffect(() => {
    const handleToggle = (e: any) => {
      setOptimisticRmfRoute(e.detail.isRmf);
    };
    window.addEventListener('rmf-nav-toggle', handleToggle as EventListener);
    return () => window.removeEventListener('rmf-nav-toggle', handleToggle as EventListener);
  }, []);

  useEffect(() => {
    // Proactively prefetch the opposite route so transitions resolve immediately
    router.prefetch(optimisticRmfRoute ? '/' : '/rate-my-faculty');
  }, [optimisticRmfRoute, router]);

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
        className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex items-end justify-center px-4 sm:px-6 xl:px-8 mx-auto gap-4 sm:gap-4"
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
            className="liquid-nav pointer-events-auto relative w-[85%] max-w-[28rem] sm:max-w-[32rem]"
            aria-label={isRmfRoute ? 'RMF Navigation' : 'Primary'}
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
                className="pointer-events-none absolute bottom-[5px] top-[5px] flex items-center justify-center z-0"
                animate={{ left: currentIndicatorLeft }}
                initial={false}
                transition={{
                  duration: 0.38,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  width: currentIndicatorWidth,
                  willChange: 'left, transform',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
              >
                <div
                  className="relative h-10 w-full overflow-hidden border backdrop-blur-md"
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

              <div className={cn("relative z-10 grid items-center", isRmfRoute ? "grid-cols-4" : "grid-cols-6")}>
                {isRmfRoute ? (
                  rmfNavItems.map((tab) => {
                    const active = pathname === tab.href;
                    return (
                      <button
                        key={tab.label}
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: 'instant' });
                          if ('external' in tab && tab.external) {
                            window.open(tab.href, '_blank', 'noopener,noreferrer');
                          } else {
                            router.push(tab.href);
                          }
                        }}
                        className={cn(
                          "relative h-[3.4rem] w-full flex items-center justify-center rounded-full text-[10px] sm:text-xs font-bold tracking-[0.1em] transition-colors duration-300",
                          active ? "text-[var(--text)]" : "text-on-surface-variant opacity-50 hover:opacity-80"
                        )}
                      >
                        <span className="relative z-10 flex items-center uppercase font-black">
                          {tab.label === 'RateMyFaculty' ? (
                            <span className="font-serif italic whitespace-nowrap">
                              <span className="hidden sm:inline">Rate<span className="text-[#C19F62]">My</span>Faculty</span>
                              <span className="sm:hidden">RMF</span>
                            </span>
                          ) : (
                            tab.label
                          )}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  navItems.map((item) => (
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
                  ))
                )}
              </div>
            </div>
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
                  background: themeConfig.mode === 'light' 
                    ? 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 20%, rgba(255,255,255,0.6)), color-mix(in srgb, var(--primary) 10%, rgba(255,255,255,0.3)))' 
                    : 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 15%, rgba(255,255,255,0.05)), color-mix(in srgb, var(--primary) 8%, rgba(255,255,255,0.02)))',
                  border: themeConfig.mode === 'light'
                    ? '1.5px solid color-mix(in srgb, var(--primary) 25%, rgba(0, 0, 0, 0.05))'
                    : '1px solid color-mix(in srgb, var(--primary) 20%, rgba(255,255,255,0.12))',
                  boxShadow: themeConfig.mode === 'light'
                    ? `0 8px 32px rgba(0, 0, 0, 0.08), inset 0 0 16px color-mix(in srgb, var(--primary) 10%, rgba(255,255,255,0.8))`
                    : '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 0 16px rgba(255,255,255,0.05)',
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
                      className="absolute inset-0 flex items-center justify-center p-1.5"
                    >
                      <img 
                        src="/images/rmf/fcuk-logo.png" 
                        alt="FcuK Academia" 
                        className="w-full h-full object-contain"
                        style={{
                          filter: themeConfig.mode === 'light' 
                            ? 'brightness(0) opacity(0.85)' 
                            : 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="rmf"
                      initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute inset-0 flex items-center justify-center p-1.5"
                    >
                      <img 
                        src={themeConfig.mode === 'light' ? "/images/rmf/rmf-logo-light.png" : "/images/rmf/rmf-logo.png"} 
                        alt="RMF" 
                        className="w-full h-full object-contain"
                        style={{
                          filter: themeConfig.mode === 'light' 
                            ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' 
                            : 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))'
                        }}
                      />
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
