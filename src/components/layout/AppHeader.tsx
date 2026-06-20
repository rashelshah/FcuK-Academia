'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import React, { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import ProfileCardDialog from '@/components/ui/ProfileCardDialog';
import UserAvatar from '@/components/ui/UserAvatar';
import { useDashboardDataContext } from '@/context/DashboardDataContext';
import { useTheme } from '@/context/ThemeContext';
import { useThemeDictionary } from '@/hooks/useThemeDictionary';
import { getInteractiveMotion } from '@/lib/motion';
import { useUser } from '@/hooks/useUser';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  title?: ReactNode;
  backHref?: string;
  showBell?: boolean;
  className?: string;
}

export default function AppHeader({
  title,
  backHref,
  showBell = true,
  className,
}: AppHeaderProps) {
  const pathname = usePathname();
  const { themeConfig } = useTheme();
  const { getTerm, getCopy } = useThemeDictionary();
  const { user } = useUser();
  const { loading, refreshing, isStale, refreshDashboard } = useDashboardDataContext();
  const motionProps = getInteractiveMotion(themeConfig.motion);
  const [profileOpen, setProfileOpen] = useState(false);
  const isSyncing = loading || refreshing;

  const defaultTitle = getTerm('dashboard') || 'FcuK Academia';
  const displayTitle = title ?? (
    themeConfig.id === 'arcade' ? (
      <div className="flex flex-col items-center justify-center -mt-1">
        <div className="animate-pulse font-label text-[8px] font-bold text-[#FF2E43] uppercase tracking-[0.3em] mb-0.5" style={{ fontFamily: '"Press Start 2P"' }}>
          PLAYER 1
        </div>
        <span 
          className="text-xl font-bold tracking-widest text-[#00A8FF]" 
          style={{ fontFamily: '"Press Start 2P"' }}
        >
          {defaultTitle}
        </span>
      </div>
    ) : (
      <span 
        className="font-headline text-[1.65rem] font-bold tracking-tight text-primary" 
        style={{ 
          fontFamily: 'Qelandsaightrial', 
          paddingTop: '4px',
        }}
      >
        {defaultTitle}
      </span>
    )
  );

  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  async function handleSync() {
    if (isSyncing) return;
    await refreshDashboard('header_sync');
  }

  const leading = backHref ? (
    <Link 
      href={backHref} 
      aria-label="Go back" 
      className="flex items-center justify-center"
      onClick={() => {
        if (themeConfig.id === 'arcade' && typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([10, 30, 10]);
        }
      }}
    >
      <motion.span
        whileHover={motionProps.whileHover}
        whileTap={motionProps.whileTap}
        transition={motionProps.transition}
        className="theme-icon-button flex items-center justify-center"
      >
        <ChevronLeft size={20} />
      </motion.span>
    </Link>
  ) : (
    <motion.button
      type="button"
      onClick={() => {
        if (themeConfig.id === 'arcade' && typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([10, 30, 10]);
        }
        setProfileOpen(true);
      }}
      whileHover={motionProps.whileHover}
      whileTap={motionProps.whileTap}
      transition={motionProps.transition}
      className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border font-label text-sm font-bold uppercase tracking-[0.08em]"
      style={{
        borderColor: 'var(--card-border)',
        boxShadow: 'var(--elevation-soft)',
        background: 'color-mix(in srgb, var(--surface-card) 84%, transparent)',
      }}
      aria-label="Open profile card"
    >
      <UserAvatar size={44} />
      <span
        className="absolute inset-0 opacity-80"
        style={{ background: 'radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 58%)' }}
      />
    </motion.button>
  );

  return (
    <>
      <header className={cn('flex items-center justify-between gap-4', className)}>
        {/* ... existing header content ... */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center">
          {leading}
        </div>
        <div className="min-w-0 flex-1 text-center">
          {typeof displayTitle === 'string' ? (
            <span className="font-headline text-[1.65rem] font-bold normal-case tracking-tight text-primary" style={{ fontFamily: 'Qelandsaightrial' }}>{displayTitle}</span>
          ) : (
            displayTitle
          )}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center">
          {showBell ? (
            <motion.button
              type="button"
              onClick={() => {
                if (themeConfig.id === 'arcade' && typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate([15, 40, 15]);
                }
                void handleSync();
              }}
              whileHover={motionProps.whileHover}
              whileTap={motionProps.whileTap}
              transition={motionProps.transition}
              className="theme-icon-button flex items-center justify-center relative"
              aria-label={isStale ? (getTerm('refresh') || 'Reconnect to refresh') : isSyncing ? 'Syncing data' : 'Sync data'}
              disabled={isSyncing}
            >
              <AnimatePresence>
                {isSyncing && themeConfig.id === 'mission-control' && (
                  <>
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-[#00E5FF]"
                        initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                        animate={{ 
                          opacity: 0, 
                          scale: 0, 
                          x: (Math.random() - 0.5) * 60, 
                          y: (Math.random() - 0.5) * 60 
                        }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        style={{ filter: 'blur(1px)' }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
              <motion.span
                animate={isSyncing ? { rotate: 360 } : { rotate: 0 }}
                transition={isSyncing ? { duration: 0.9, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <RefreshCw size={18} className={cn(isStale ? "text-error" : "text-primary")} />
              </motion.span>
            </motion.button>
          ) : null}
        </div>
      </header>

      {isStale && !isSyncing && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-2 overflow-hidden"
        >
          {themeConfig.id === 'arcade' ? (
            <div 
              className="flex flex-col items-center justify-center gap-1.5 p-3 text-center border-[4px] border-[#FF2E43]"
              style={{ 
                background: '#0A0A0A',
                animation: 'pixel-blink 2s infinite',
                boxShadow: '0 0 15px rgba(255, 46, 67, 0.4)'
              }}
            >
              <h3 className="font-headline text-[#FF2E43] text-lg tracking-widest uppercase animate-pulse" style={{ fontFamily: '"Press Start 2P"' }}>
                {getCopy('session', 'expired', 'CONTINUE?')}
              </h3>
              <p className="font-label text-[9px] text-white uppercase tracking-widest" style={{ fontFamily: '"Press Start 2P"' }}>
                {getCopy('session', 'reconnect', 'INSERT LOGIN TO RESUME SESSION')}
              </p>
            </div>
          ) : (
            <div 
              className="flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-center"
              style={{ 
                background: 'color-mix(in srgb, var(--error) 8%, transparent)',
                border: '1px solid color-mix(in srgb, var(--error) 20%, transparent)' 
              }}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-error animate-pulse" />
              <span className="font-label text-[10px] font-bold uppercase tracking-wider text-error">
                {getCopy('session', 'reconnect', 'Live data unavailable — reconnect to refresh')}
              </span>
            </div>
          )}
        </motion.div>
      )}

      <ProfileCardDialog open={profileOpen} onClose={() => setProfileOpen(false)} user={user} />
    </>
  );
}
