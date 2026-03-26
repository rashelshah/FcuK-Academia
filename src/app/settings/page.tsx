'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { Bell, ChevronRight, LogOut, RefreshCw, ShieldCheck, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

import AppHeader from '@/components/layout/AppHeader';
import DayOrderSelector from '@/components/settings/DayOrderSelector';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import UserAvatar from '@/components/ui/UserAvatar';
import { useAppState } from '@/context/AppStateContext';
import { useDashboardDataContext } from '@/context/DashboardDataContext';
import { useTheme } from '@/context/ThemeContext';
import { getCompactCourseLabel } from '@/lib/academia-ui';
import { getInteractiveMotion } from '@/lib/motion';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { themeConfig } = useTheme();
  const { user, loading } = useUser();
  const { refreshing, refreshDashboard } = useDashboardDataContext();
  const { activeDayOrder } = useAppState();
  const router = useRouter();
  const motionProps = getInteractiveMotion(themeConfig.motion);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const compactCourse = getCompactCourseLabel(user);

  const syncLabel = useMemo(() => {
    if (loading) return 'live sync';
    if (!user) return 'session off';
    return `sem ${user.semester} / ${user.batch}`;
  }, [loading, user]);

  async function handleLogout() {
    setLogoutLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  async function handleSync() {
    if (refreshing) return;

    await refreshDashboard();
    router.refresh();
  }

  return (
    <div className="space-y-7 pb-36 pt-4">
      <AppHeader />

      <section className="space-y-2 px-1">
        <p className="theme-kicker">settings</p>
        <h1 className="font-headline text-[clamp(2.8rem,13vw,4.6rem)] font-bold leading-[0.9] text-on-surface">
          clean control
        </h1>
      </section>

      <GlassCard className="p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-[24px] p-1.5" style={{ background: 'color-mix(in srgb, var(--surface-card-elevated) 92%, transparent)' }}>
            <UserAvatar size={72} />
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="theme-kicker">profile</p>
            <h2 className="font-headline text-2xl font-bold text-on-surface">
              {user?.name || 'Live SRM session'}
            </h2>
            <p className="text-sm leading-5 text-on-surface-variant">
              {user ? `${user.regNumber} / ${compactCourse}` : 'Live account details appear here.'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="theme" value={themeConfig.label} />
          <StatTile label="sync" value={syncLabel} />
          <StatTile label="course" value={compactCourse} />
          <StatTile label="day order" value={activeDayOrder ? `day ${activeDayOrder}` : 'not set'} />
        </div>
      </GlassCard>

      <section className="space-y-4">
        <SectionHeading
          kicker="appearance"
          title="theme system"
        />

        <GlassCard className="space-y-6 px-4 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="theme-kicker">active theme</p>
              <h3 className="font-headline text-xl font-bold text-on-surface">{themeConfig.label}</h3>
            </div>
            <div className="flex gap-2">
              {themeConfig.preview.map((color) => (
                <span
                  key={color}
                  className="h-4 w-4 rounded-full border border-white/10"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <Link href="/settings/theme" className="block">
            <motion.div
              whileHover={motionProps.whileHover}
              whileTap={motionProps.whileTap}
              transition={motionProps.transition}
              className="theme-panel flex items-center justify-between gap-4 p-4"
            >
              <div>
                <h4 className="font-headline text-xl font-bold text-on-surface">select theme</h4>
              </div>
              <ChevronRight size={18} className="shrink-0 text-on-surface-variant" />
            </motion.div>
          </Link>
        </GlassCard>
      </section>

      <section className="space-y-4">
        <SectionHeading
          kicker="preferences"
          title="daily controls"
        />

        <GlassCard className="p-5">
          <div className="flex flex-col gap-6">
            <ToggleRow
              icon={Bell}
              title="notifications"
              subtitle={user?.mobile || 'Stay updated on class alerts'}
              checked={notificationsEnabled}
              onChange={() => setNotificationsEnabled((current) => !current)}
              motionProps={motionProps}
            />
            <PreferenceLink
              href="/settings/theme"
              icon={Sparkles}
              title="select theme"
              subtitle={themeConfig.label}
              motionProps={motionProps}
            />
            <SyncRow
              syncing={refreshing}
              onSync={handleSync}
              motionProps={motionProps}
            />
            <PrivacyRow
              onOpen={() => setPrivacyOpen(true)}
              motionProps={motionProps}
            />
          </div>
        </GlassCard>
      </section>

      <DayOrderSelector />

      <section className="space-y-4 pt-1">
        <Button variant="brutalist" fullWidth onClick={handleLogout} disabled={logoutLoading}>
          <LogOut size={26} />
          {logoutLoading ? 'logging out...' : 'abort mission / logout'}
        </Button>
        <p className="text-center text-[10px] uppercase tracking-[0.24em] text-on-surface-variant/70">
          {user ? `${user.name.toLowerCase()} / ${user.regNumber}` : 'live SRM session'}
        </p>
      </section>

      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  );
}

function SectionHeading({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-1.5 px-1">
      <p className="theme-kicker">{kicker}</p>
      <h2 className="font-headline text-3xl font-bold text-on-surface">{title}</h2>
      {subtitle ? <p className="max-w-sm text-sm leading-6 text-on-surface-variant">{subtitle}</p> : null}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="theme-panel min-h-[88px] px-4 py-3.5">
      <p className="theme-kicker">{label}</p>
      <p className="mt-2 text-sm font-semibold capitalize leading-5 text-on-surface">
        {value}
      </p>
    </div>
  );
}

function PreferenceLink({
  href,
  icon: Icon,
  title,
  subtitle,
  motionProps,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  motionProps: ReturnType<typeof getInteractiveMotion>;
}) {
  return (
    <Link href={href} className="block">
      <PreferenceRow
        icon={Icon}
        title={title}
        subtitle={subtitle}
        motionProps={motionProps}
        action={<ChevronRight size={18} className="text-on-surface-variant" />}
      />
    </Link>
  );
}

function PreferenceRow({
  icon: Icon,
  title,
  subtitle,
  motionProps,
  action,
  tone = 'default',
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  motionProps: ReturnType<typeof getInteractiveMotion>;
  action?: React.ReactNode;
  tone?: 'default' | 'secondary' | 'primary';
}) {
  return (
    <motion.div
      whileHover={motionProps.whileHover}
      whileTap={motionProps.whileTap}
      transition={motionProps.transition}
      className="flex items-start justify-between gap-4 rounded-[var(--radius-md)] border p-4"
      style={{ borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--surface-soft) 90%, transparent)' }}
    >
      <div className="flex min-w-0 items-start gap-4">
        <div
          className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border', tone === 'secondary' ? 'text-secondary' : tone === 'primary' ? 'text-primary' : 'text-on-surface-variant')}
          style={{
            borderColor: tone === 'secondary'
              ? 'color-mix(in srgb, var(--secondary) 28%, transparent)'
              : tone === 'primary'
                ? 'color-mix(in srgb, var(--primary) 28%, transparent)'
                : 'var(--card-border)',
            background: tone === 'secondary'
              ? 'color-mix(in srgb, var(--secondary) 12%, transparent)'
              : tone === 'primary'
                ? 'color-mix(in srgb, var(--primary) 12%, transparent)'
                : 'color-mix(in srgb, var(--surface-elevated) 84%, transparent)',
          }}
        >
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="font-headline text-lg font-bold text-on-surface">{title}</h3>
          <p className="mt-1 text-[13px] leading-5 text-on-surface-variant">{subtitle}</p>
        </div>
      </div>
      <div className="self-center shrink-0">
        {action ?? <ChevronRight size={18} className="text-on-surface-variant" />}
      </div>
    </motion.div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  subtitle,
  checked,
  onChange,
  motionProps,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: () => void;
  motionProps: ReturnType<typeof getInteractiveMotion>;
}) {
  return (
    <motion.button
      type="button"
      onClick={onChange}
      whileHover={motionProps.whileHover}
      whileTap={motionProps.whileTap}
      transition={motionProps.transition}
      className="flex w-full items-start justify-between gap-4 rounded-[var(--radius-md)] border p-4 text-left"
      style={{ borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--surface-soft) 90%, transparent)' }}
    >
      <div className="flex min-w-0 items-start gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border text-secondary"
          style={{
            borderColor: 'color-mix(in srgb, var(--secondary) 28%, transparent)',
            background: 'color-mix(in srgb, var(--secondary) 12%, transparent)',
          }}
        >
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="font-headline text-lg font-bold text-on-surface">{title}</h3>
          <p className="mt-1 text-[13px] leading-5 text-on-surface-variant">{subtitle}</p>
        </div>
      </div>

      <div
        className="flex h-7 w-12 shrink-0 self-center items-center rounded-[var(--radius-pill)] px-1"
        style={{
          background: checked
            ? 'color-mix(in srgb, var(--secondary) 24%, transparent)'
            : 'color-mix(in srgb, var(--surface-highlight) 86%, transparent)',
        }}
      >
        <motion.div
          animate={{ x: checked ? 20 : 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="h-5 w-5 rounded-full"
          style={{
            background: checked ? 'var(--secondary)' : 'var(--text-subtle)',
            boxShadow: checked ? 'var(--glow-secondary)' : 'none',
          }}
        />
      </div>
    </motion.button>
  );
}

function SyncRow({
  syncing,
  onSync,
  motionProps,
}: {
  syncing: boolean;
  onSync: () => Promise<void>;
  motionProps: ReturnType<typeof getInteractiveMotion>;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => {
        void onSync();
      }}
      whileHover={syncing ? undefined : motionProps.whileHover}
      whileTap={syncing ? undefined : motionProps.whileTap}
      transition={motionProps.transition}
      disabled={syncing}
      className="flex w-full items-center justify-between gap-4 rounded-[var(--radius-md)] border px-4 py-3.5 text-left disabled:cursor-not-allowed disabled:opacity-90"
      style={{ borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--surface-soft) 90%, transparent)' }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border text-primary"
          style={{
            borderColor: 'color-mix(in srgb, var(--primary) 28%, transparent)',
            background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
          }}
        >
          <RefreshCw size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-headline text-lg font-bold text-on-surface">sync</h3>
          <p className="mt-1 text-[13px] leading-5 text-on-surface-variant">
            Refresh attendance, timetable, calendar, and session data.
          </p>
        </div>
      </div>

      <motion.div
        layout
        className="inline-flex h-10 shrink-0 self-center items-center gap-2 whitespace-nowrap rounded-[var(--radius-pill)] px-4 py-2 font-label text-[10px] font-bold uppercase leading-none tracking-[0.22em]"
        style={{
          background: syncing
            ? 'color-mix(in srgb, var(--secondary) 18%, transparent)'
            : 'color-mix(in srgb, var(--primary) 18%, transparent)',
          color: syncing ? 'var(--secondary)' : 'var(--primary)',
          boxShadow: syncing ? 'var(--glow-secondary)' : 'none',
        }}
      >
        <motion.span
          animate={syncing ? { rotate: 360 } : { rotate: 0 }}
          transition={syncing ? { duration: 0.9, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }}
          className="inline-flex"
        >
          <RefreshCw size={14} />
        </motion.span>
        <span>{syncing ? 'syncing...' : 'sync'}</span>
      </motion.div>
    </motion.button>
  );
}

function PrivacyRow({
  onOpen,
  motionProps,
}: {
  onOpen: () => void;
  motionProps: ReturnType<typeof getInteractiveMotion>;
}) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={motionProps.whileHover}
      whileTap={motionProps.whileTap}
      transition={motionProps.transition}
      className="flex w-full items-start justify-between gap-4 rounded-[var(--radius-md)] border p-4 text-left"
      style={{ borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--surface-soft) 90%, transparent)' }}
    >
      <div className="flex min-w-0 items-start gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border text-secondary"
          style={{
            borderColor: 'color-mix(in srgb, var(--secondary) 28%, transparent)',
            background: 'color-mix(in srgb, var(--secondary) 12%, transparent)',
          }}
        >
          <ShieldCheck size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="font-headline text-lg font-bold text-on-surface">privacy</h3>
          <p className="mt-1 text-[13px] leading-5 text-on-surface-variant">
            See exactly how your data is used inside the app.
          </p>
        </div>
      </div>
      <ChevronRight size={18} className="shrink-0 text-on-surface-variant" />
    </motion.button>
  );
}

function PrivacyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [open]);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[999] flex min-h-screen w-full items-end justify-center overflow-hidden bg-black/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <motion.div
            className="relative flex h-[100dvh] w-full max-w-[28rem] flex-col overflow-hidden border px-4 pb-6 pt-5 sm:max-w-[34rem] sm:px-6 lg:max-w-[44rem] xl:max-w-[52rem]"
            style={{
              background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, black 4%) 0%, color-mix(in srgb, var(--surface-soft) 94%, transparent) 100%)',
              borderColor: 'var(--border-strong)',
              boxShadow: '0 28px 80px rgba(0,0,0,0.45)',
            }}
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.9 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-70" style={{ background: 'var(--hero-gradient)' }} />

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="theme-kicker">privacy</p>
                <h2 className="mt-2 font-headline text-[2.6rem] font-bold leading-[0.9] tracking-tight text-on-surface">
                  privacy (no shady stuff)
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="theme-icon-button flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                aria-label="Close privacy details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative z-10 mt-6 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-2">
              <div
                className="rounded-[32px] border p-5"
                style={{
                  background: 'color-mix(in srgb, var(--surface-soft) 92%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--secondary) 24%, var(--border))',
                  boxShadow: 'var(--elevation-card)',
                }}
              >
                <p className="text-base leading-8 text-on-surface-variant">
                  we&apos;re not here to spy on you, just to make your academic life less painful. your SRM login is only used to pull your marks, attendance, and timetable in real-time so you don&apos;t have to deal with that clunky portal again. we don&apos;t store your data, we don&apos;t sell it, and we&apos;re definitely not tracking you around the internet like some weird stalker 💀. everything stays between you and the official API, and we simply display it in a way that actually makes sense. if you turn on notifications, expect only useful stuff like “you&apos;re cooked 💀” alerts or attendance warnings, never spam. your data stays yours, always. we&apos;re just the middleman making things look cool.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
