'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap, Shield, X } from 'lucide-react';
import React, { useEffect } from 'react';

import UserAvatar from '@/components/ui/UserAvatar';
import { getInteractiveMotion } from '@/lib/motion';
import { useTheme } from '@/context/ThemeContext';
import { getCompactCourseLabel } from '@/lib/academia-ui';
import type { DashboardData } from '@/lib/api/types';

interface ProfileCardDialogProps {
  open: boolean;
  onClose: () => void;
  user: DashboardData['userInfo'] | null;
}

export default function ProfileCardDialog({ open, onClose, user }: ProfileCardDialogProps) {
  const { themeConfig } = useTheme();
  const motionProps = getInteractiveMotion(themeConfig.motion);
  const courseLabel = getCompactCourseLabel(user);

  useEffect(() => {
    if (!open) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.documentElement.style.overflow = 'hidden';
    let isClosing = false;
    let touchStartX = 0;
    let touchStartY = 0;

    function requestClose(event?: Event) {
      if (isClosing) return;
      isClosing = true;
      event?.preventDefault();
      onClose();
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') requestClose();
    }

    function handleWheel(event: WheelEvent) {
      if (Math.abs(event.deltaX) < 1 && Math.abs(event.deltaY) < 1) return;
      requestClose(event);
    }

    function handleTouchStart(event: TouchEvent) {
      const touch = event.touches[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }

    function handleTouchMove(event: TouchEvent) {
      const touch = event.touches[0];
      if (!touch) return;

      const deltaX = Math.abs(touch.clientX - touchStartX);
      const deltaY = Math.abs(touch.clientY - touchStartY);

      if (deltaX < 8 && deltaY < 8) return;
      requestClose(event);
    }

    function handleScroll() {
      requestClose();
    }

    window.addEventListener('keydown', handleEscape);
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('wheel', handleWheel, true);
      window.removeEventListener('touchstart', handleTouchStart, true);
      window.removeEventListener('touchmove', handleTouchMove, true);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="profile-card-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[140] flex items-center justify-center px-5"
          style={{
            background: 'var(--overlay-backdrop)',
            backdropFilter: `blur(var(--overlay-blur))`,
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{
              duration: Math.max(0.26, themeConfig.motion.reveal.duration),
              ease: [0.22, 1, 0.36, 1],
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Student ID card"
            className="relative w-full max-w-sm overflow-hidden rounded-[34px] border"
            style={{
              borderColor: 'var(--card-border)',
              background: 'var(--surface-card)',
              boxShadow: 'var(--elevation-floating)',
            }}
          >
            <div className="absolute left-1/2 top-0 z-10 h-5 w-20 -translate-x-1/2 rounded-b-[18px]" style={{ background: 'color-mix(in srgb, var(--surface-card-elevated) 90%, transparent)', borderLeft: '1px solid var(--card-border)', borderRight: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }} />
            <div className="absolute left-5 right-5 top-5 z-0 h-28 rounded-[24px]" style={{ background: 'var(--hero-gradient)', opacity: 0.92 }} />

            <div className="relative z-10 flex flex-col gap-5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="theme-kicker">student id card</p>
                  <h2 className="font-headline text-2xl font-black text-on-surface">
                    {user?.name || 'SRM Student'}
                  </h2>
                </div>
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={motionProps.whileHover}
                  whileTap={motionProps.whileTap}
                  transition={motionProps.transition}
                  className="theme-icon-button flex items-center justify-center"
                  aria-label="Close profile card"
                >
                  <X size={18} />
                </motion.button>
              </div>

              <div
                className="grid grid-cols-[auto,1fr] items-center gap-4 rounded-[28px] border p-4"
                style={{
                  borderColor: 'var(--card-border)',
                  background: 'color-mix(in srgb, var(--surface-card-soft) 96%, transparent)',
                }}
              >
                <div className="rounded-[24px] p-1" style={{ background: 'color-mix(in srgb, var(--surface-card-elevated) 88%, transparent)' }}>
                  <UserAvatar size={80} />
                </div>
                <div className="min-w-0 space-y-3">
                  <div>
                    <p className="theme-kicker">registration number</p>
                    <p className="mt-1 font-headline text-[1.35rem] font-black leading-none text-on-surface">
                      {user?.regNumber || 'Not available'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <MiniInfo label="semester" value={user?.semester || 'N/A'} />
                    <MiniInfo label="batch" value={user?.batch || 'N/A'} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <InfoRow icon={GraduationCap} label="course" value={courseLabel} />
                <InfoRow icon={Shield} label="program" value={user?.program || 'Not available'} />
                <InfoRow icon={Shield} label="section" value={user?.section || 'Not available'} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-[22px] border px-4 py-3"
      style={{
        borderColor: 'var(--card-border)',
        background: 'var(--surface-card-elevated)',
      }}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-[16px] text-primary"
        style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)' }}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="theme-kicker">{label}</p>
        <p className="mt-1 text-sm font-semibold leading-5 text-on-surface">{value}</p>
      </div>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="theme-kicker">{label}</p>
      <p className="mt-1 font-semibold text-on-surface">{value}</p>
    </div>
  );
}
