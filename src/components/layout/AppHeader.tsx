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
  title = <span className="font-headline text-xl font-bold normal-case tracking-tight text-primary">FcuK Academia</span>,
  backHref,
  showBell = true,
  className,
}: AppHeaderProps) {
  const pathname = usePathname();
  const { themeConfig } = useTheme();
  const { user } = useUser();
  const { refreshing, refreshDashboard } = useDashboardDataContext();
  const motionProps = getInteractiveMotion(themeConfig.motion);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  async function handleSync() {
    if (refreshing) return;
    await refreshDashboard();
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
        <div className="flex h-11 w-11 shrink-0 items-center justify-center">
          {leading}
        </div>
        <div className="min-w-0 flex-1 text-center">
          {typeof title === 'string' ? (
            <span className="font-headline text-xl font-bold normal-case tracking-tight text-primary">{title}</span>
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
              aria-label={refreshing ? 'Syncing data' : 'Sync data'}
              disabled={refreshing}
            >
              <motion.span
                animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                transition={refreshing ? { duration: 0.9, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <RefreshCw size={18} className="text-primary" />
              </motion.span>
            </motion.button>
          ) : null}
        </div>
      </header>

      <ProfileCardDialog open={profileOpen} onClose={() => setProfileOpen(false)} user={user} />
    </>
  );
}
