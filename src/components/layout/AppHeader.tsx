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
import { getInteractiveMotion } from '@/lib/motion';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  title?: ReactNode;
  backHref?: string;
  showBell?: boolean;
  className?: string;
}

export default function AppHeader({
  title = <span className="font-headline text-[1.65rem] font-bold normal-case tracking-tight text-primary" style={{ fontFamily: 'Qelandsaightrial', paddingTop: '4px' }}>FcuK Academia</span>,
  backHref,
  showBell = true,
  className,
}: AppHeaderProps) {
  const pathname = usePathname();
  const { themeConfig } = useTheme();
  const { user } = useUser();
  const { loading, refreshing, isStale, refreshDashboard } = useDashboardDataContext();
  const motionProps = getInteractiveMotion(themeConfig.motion);
  const [profileOpen, setProfileOpen] = useState(false);
  const isSyncing = loading || refreshing;

  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  async function handleSync() {
    if (isSyncing) return;
    await refreshDashboard('header_sync');
  }

  const leading = backHref ? (
    <Link href={backHref} aria-label="Go back" className="flex items-center justify-center">
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
      onClick={() => setProfileOpen(true)}
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
          {typeof title === 'string' ? (
            <span className="font-headline text-[1.65rem] font-bold normal-case tracking-tight text-primary" style={{ fontFamily: 'Qelandsaightrial' }}>{title}</span>
          ) : (
            title
          )}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center">
          {showBell ? (
            <motion.button
              type="button"
              onClick={() => {
                void handleSync();
              }}
              whileHover={motionProps.whileHover}
              whileTap={motionProps.whileTap}
              transition={motionProps.transition}
              className="theme-icon-button flex items-center justify-center"
              aria-label={isStale ? 'Reconnect to refresh' : isSyncing ? 'Syncing data' : 'Sync data'}
              disabled={isSyncing}
            >
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
          <div 
            className="flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-center"
            style={{ 
              background: 'color-mix(in srgb, var(--error) 8%, transparent)',
              border: '1px solid color-mix(in srgb, var(--error) 20%, transparent)' 
            }}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-error animate-pulse" />
            <span className="font-label text-[10px] font-bold uppercase tracking-wider text-error">
              Live data unavailable — reconnect to refresh
            </span>
          </div>
        </motion.div>
      )}

      <ProfileCardDialog open={profileOpen} onClose={() => setProfileOpen(false)} user={user} />
    </>
  );
}
