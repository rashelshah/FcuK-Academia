'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, ChevronRight, LogOut, MessageCircle, RefreshCw, ShieldCheck, Sparkles, X } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

import AppHeader from '@/components/layout/AppHeader';
import DayOrderSelector from '@/components/settings/DayOrderSelector';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import UserAvatar from '@/components/ui/UserAvatar';
import { useAppState } from '@/context/AppStateContext';
import { useDashboardDataContext } from '@/context/DashboardDataContext';
import { useNotificationContext } from '@/context/NotificationContext';
import { useTheme } from '@/context/ThemeContext';
import { formatRegistrationNumber, getCompactCourseLabel } from '@/lib/academia-ui';
import { clearNotificationToken } from '@/lib/notifications/getToken';
import { getInteractiveMotion } from '@/lib/motion';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import { WHATSAPP_COMMUNITY_POPUP_CONFIG } from '@/lib/features';


export default function SettingsPage() {
  const { themeConfig } = useTheme();
  const { user, loading } = useUser();
  const { refreshing, refreshDashboard } = useDashboardDataContext();
  const { activeDayOrder } = useAppState();
  const {
    notificationsEnabled,
    permissionState,
    setNotificationsEnabled,
  } = useNotificationContext();
  const router = useRouter();
  const motionProps = getInteractiveMotion(themeConfig.motion);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const compactCourse = getCompactCourseLabel(user);
  const formattedRegNumber = formatRegistrationNumber(user?.regNumber);

  const syncLabel = useMemo(() => {
    if (loading) return 'live sync';
    if (!user) return 'session off';
    return `sem ${user.semester} / ${user.batch}`;
  }, [loading, user]);

  async function handleLogout() {
    setLogoutLoading(true);
    await clearNotificationToken();
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  async function handleSync() {
    if (refreshing) return;

    await refreshDashboard('settings_sync');
    router.refresh();
  }

  async function handleNotificationPress() {
    await setNotificationsEnabled(!notificationsEnabled);
  }

  const notificationSubtitle = useMemo(() => {
    if (notificationsEnabled && permissionState === 'granted') {
      return 'push + in-app alerts are live. expect funny saves before college chaos hits.';
    }

    if (notificationsEnabled && (permissionState === 'denied' || permissionState === 'unsupported')) {
      return 'fallback mode is active. in-app alerts still work even when push cannot.';
    }

    return 'turn this on for class alerts, attendance warnings, mark drops, and admin broadcasts.';
  }, [notificationsEnabled, permissionState]);

  const notificationStatusLabel = useMemo(() => {
    if (!notificationsEnabled) return 'off';
    if (permissionState === 'granted') return 'live';
    return 'fallback';
  }, [notificationsEnabled, permissionState]);

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
              {user ? `${formattedRegNumber} / ${compactCourse}` : 'Live account details appear here.'}
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
              subtitle={notificationSubtitle}
              checked={notificationsEnabled}
              statusLabel={notificationStatusLabel}
              onChange={() => {
                void handleNotificationPress();
              }}
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
            <CommunityRow />
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
          {user ? `${user.name.toLowerCase()} / ${formattedRegNumber}` : 'live SRM session'}
        </p>
        <DeveloperFooter />
      </section>

      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  );
}

function DeveloperFooter() {
  const developerNames = 'Rashel Shah and Biswajit Sahu';
  const sponsorNames = 'Kanhaiya Kumar | Aprit Kumar Pandey | Vidharv Thakur';

  return (
    <div className="mx-auto mt-2 mb-2 flex max-w-[19rem] flex-col items-center gap-1.5 overflow-hidden px-1">
      <div className="flex max-w-full items-center justify-center gap-2">
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.22em] text-on-surface-variant/55">
          developed by:
        </span>
        <span className="whitespace-nowrap text-[10px] font-semibold tracking-[0.12em] text-on-surface">
          {developerNames}
        </span>
      </div>

      <div className="flex w-full items-center justify-center gap-2 overflow-hidden">
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.22em] text-on-surface-variant/55">
          sponsored by:
        </span>
        <SponsorTicker text={sponsorNames} />
      </div>
    </div>
  );
}

function SponsorTicker({ text }: { text: string }) {
  const { scrollY } = useScroll();
  const rawVelocity = useVelocity(scrollY);
  const smoothedVelocity = useSpring(rawVelocity, { damping: 44, stiffness: 220 });
  const velocityFactor = useTransform(smoothedVelocity, [-1600, 0, 1600], [-2.2, 0, 2.2]);
  const baseX = useMotionValue(0);
  const [contentWidth, setContentWidth] = useState(0);
  const contentRef = useRef<HTMLSpanElement | null>(null);
  const directionFactor = useRef(-1);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const updateWidth = () => {
      setContentWidth(node.getBoundingClientRect().width);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (!contentWidth) return;

    const velocity = velocityFactor.get();
    if (velocity < 0) {
      directionFactor.current = -1;
    } else if (velocity > 0) {
      directionFactor.current = 1;
    }

    const baseMove = 0.038 * delta;
    const boostedMove = baseMove * Math.max(1, Math.abs(velocity) * 1.35);
    let next = baseX.get() + (directionFactor.current * boostedMove);

    if (next <= -contentWidth) {
      next += contentWidth;
    } else if (next >= 0) {
      next -= contentWidth;
    }

    baseX.set(next);
  });

  return (
    <div className="relative h-4 min-w-0 flex-1 overflow-hidden">
      <motion.div
        className="absolute left-0 top-0 flex whitespace-nowrap text-[10px] font-medium tracking-[0.12em] text-on-surface will-change-transform"
        style={{ x: baseX }}
      >
        <span ref={contentRef} className="pr-8">
          {text}
        </span>
        <span className="pr-8" aria-hidden="true">
          {text}
        </span>
        <span className="pr-8" aria-hidden="true">
          {text}
        </span>
      </motion.div>
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
  statusLabel,
  onChange,
  motionProps,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  checked: boolean;
  statusLabel?: string;
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

      <div className="flex shrink-0 items-center gap-3 self-center">
        {statusLabel ? (
          <span
            className="rounded-[var(--radius-pill)] px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{
              background: 'color-mix(in srgb, var(--accent) 16%, transparent)',
              color: 'var(--accent)',
            }}
          >
            {statusLabel}
          </span>
        ) : null}
        <div
          className="flex h-7 w-12 items-center rounded-[var(--radius-pill)] px-1"
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

function CommunityRow() {
  const handleCommunityClick = () => {
    const analyticsWindow = window as Window & {
      gtag?: (event: string, action: string, params?: Record<string, string>) => void;
    };

    if (typeof analyticsWindow.gtag === 'function') {
      analyticsWindow.gtag('event', 'community_click', {
        location: 'settings'
      });
    }
    window.open(WHATSAPP_COMMUNITY_POPUP_CONFIG.whatsappUrl, '_blank');
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={handleCommunityClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCommunityClick();
        }
      }}
      whileHover={{ scale: 0.99, borderColor: 'color-mix(in srgb, var(--accent) 40%, transparent)', boxShadow: '0 4px 12px 0px color-mix(in srgb, var(--accent) 15%, transparent)' }}
      whileTap={{ scale: 0.97, borderColor: 'color-mix(in srgb, var(--accent) 60%, transparent)', boxShadow: '0 0 16px 0px color-mix(in srgb, var(--accent) 30%, transparent)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="flex w-full cursor-pointer items-start justify-between gap-4 rounded-[var(--radius-md)] border p-4 text-left"
      style={{ borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--surface-soft) 90%, transparent)' }}
    >
      <div className="flex min-w-0 items-start gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border transition-colors duration-200"
          style={{
            color: 'var(--accent)',
            borderColor: 'color-mix(in srgb, var(--accent) 28%, transparent)',
            background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
          }}
        >
          <MessageCircle size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="font-headline text-lg font-bold text-on-surface">community</h3>
          <p className="mt-1 text-[13px] leading-5 text-on-surface-variant">
            join the gng. updates, fixes & chaos.
          </p>
        </div>
      </div>
      <ChevronRight size={18} className="shrink-0 self-center text-on-surface-variant" />
    </motion.div>
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

            <div className="relative z-10 mt-6 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-8 px-1 scrollbar-hide">
              <div
                className="rounded-[32px] border p-6 space-y-8"
                style={{
                  background: 'color-mix(in srgb, var(--surface-soft) 92%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--secondary) 24%, var(--border))',
                  boxShadow: 'var(--elevation-card)',
                }}
              >
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/40 font-bold">Last Updated: 16th April 2026</p>
                  <p className="text-[15px] leading-7 font-medium text-on-surface">
                    We’re not here to spy on you. We’re here to make your academic life less painful 😭
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-on-surface-variant font-medium">Your SRM login is only used to fetch your:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { icon: '📊', label: 'Marks' },
                      { icon: '📈', label: 'Attendance' },
                      { icon: '📅', label: 'Timetable' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3 p-3 rounded-2xl bg-on-surface/[0.03] border border-on-surface/5">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-on-surface">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[13px] leading-6 text-on-surface-variant italic opacity-80">
                    …in real-time — so you don’t have to deal with that clunky portal again.
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-[13px] leading-6 text-on-surface-variant">
                    We don’t store your data. We don’t sell it. We’re definitely not tracking you around the internet like some weird stalker 💀
                  </p>
                  <p className="text-[13px] leading-6 text-on-surface-variant font-bold text-on-surface">
                    Everything stays between you and the official system — we just make it look better.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl bg-secondary/5 p-5 border border-secondary/10">
                  <h3 className="font-headline text-sm font-bold flex items-center gap-2 text-secondary uppercase tracking-widest">
                    🔐 What We Actually Do
                  </h3>
                  <ul className="space-y-2.5">
                    {[
                      'We do not permanently store your academic data',
                      'We do not sell or share your personal data',
                      'We do not track your activity across other websites',
                      'We do not store your passwords beyond necessary session usage',
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-3 text-[13px] text-on-surface-variant">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary/40" />
                        {text}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 p-4 rounded-xl bg-on-surface/[0.04] border border-on-surface/5 text-center italic text-[12px] text-on-surface leading-normal">
                    &laquo;fetched in real-time using user-authorized access and shown with improved UI/UX.&raquo;
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-headline text-sm font-bold flex items-center gap-2 text-on-surface uppercase tracking-widest">
                    🔔 Notifications
                  </h3>
                  <div className="space-y-3">
                    <p className="text-[13px] text-on-surface-variant">If enabled, you&apos;ll get alerts like:</p>
                    <div className="flex flex-wrap gap-2">
                      {['attendance warnings 📉', 'marks updates 📊', 'you’re cooked 💀'].map((tag) => (
                        <span key={tag} className="px-3 py-1.5 rounded-full bg-on-surface/[0.04] border border-on-surface/5 text-[11px] font-bold text-on-surface-variant">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-[13px] leading-6 text-on-surface-variant">
                      We do <span className="text-secondary font-bold">NOT</span> send spam or promotional junk. Only useful stuff. Promise.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-on-surface opacity-60">Ownership</h4>
                    <p className="text-[13px] text-on-surface-variant leading-relaxed">Your data is yours. Controlled by your institution. We don&apos;t own it.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-on-surface opacity-60">Display</h4>
                    <p className="text-[13px] text-on-surface-variant leading-relaxed">We don&apos;t claim it. We just display it better for you.</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
                  <h3 className="font-headline text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-widest">
                    ⚠️ Security Note
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3 text-[12px] text-on-surface-variant">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                      Users are responsible for protecting their own login credentials
                    </li>
                    <li className="flex items-start gap-3 text-[12px] text-on-surface-variant">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                      Always use official sources for critical verification
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-headline text-sm font-bold text-on-surface uppercase tracking-widest">
                    Transparency Statement
                  </h3>
                  <p className="text-[13px] text-on-surface-variant">FCUK Academia acts only as:</p>
                  <div className="p-4 rounded-xl bg-on-surface/[0.04] border border-on-surface/5 text-center italic text-[12px] text-on-surface leading-normal">
                    &laquo;a visual interface layer between you and your academic system&raquo;
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {['No interference', 'No central db', 'No redistribution'].map((feat) => (
                      <div key={feat} className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-on-surface/20" />
                        <span className="text-[11px] font-bold text-on-surface-variant opacity-60 uppercase tracking-wider">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-on-surface/10 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-headline text-sm font-bold text-on-surface uppercase tracking-widest flex items-center gap-2">
                        🎭 Branding
                      </h3>
                      <p className="text-[11px] text-on-surface-variant font-medium">FCUK stands for Fully Controlled University Kit.</p>
                    </div>
                    <span className="text-[10px] px-3 py-1 rounded-full bg-on-surface/5 text-on-surface-variant italic">No hidden meaning. Relax 😏</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-on-surface/[0.02] border border-on-surface/5 mt-4">
                    <h3 className="font-headline text-[13px] font-bold text-on-surface flex items-center gap-2 italic">
                      💬 Final Word
                    </h3>
                    <p className="mt-2 text-[12px] text-on-surface-variant leading-relaxed italic opacity-80">
                      Your data stays yours. Always. We&apos;re just the middleman making things look cool ✨
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
