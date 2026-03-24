'use client';

import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { Bell, ChevronRight, LogOut, MoonStar, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import AppHeader from '@/components/layout/AppHeader';
import DayOrderSelector from '@/components/settings/DayOrderSelector';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import { useAppState } from '@/context/AppStateContext';
import { useTheme } from '@/context/ThemeContext';
import { getInteractiveMotion } from '@/lib/motion';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { themeConfig } = useTheme();
  const { user, loading } = useUser();
  const { activeDayOrder, dayOrderSource } = useAppState();
  const router = useRouter();
  const motionProps = getInteractiveMotion(themeConfig.motion);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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

  return (
    <div className="space-y-7 pb-36 pt-4">
      <AppHeader />

      <section className="space-y-2 px-1">
        <p className="theme-kicker">settings</p>
        <h1 className="font-headline text-[clamp(2.8rem,13vw,4.6rem)] font-bold leading-[0.9] text-on-surface">
          clean control
        </h1>
      </section>

      <GlassCard className="space-y-6 p-6">
        <div className="space-y-1.5">
          <p className="theme-kicker">profile</p>
          <h2 className="font-headline text-2xl font-bold text-on-surface">
            {user?.name || 'Live SRM session'}
          </h2>
          <p className="text-sm leading-5 text-on-surface-variant">
            {user ? `${user.regNumber} / ${user.department}` : 'Live account details appear here.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="theme" value={themeConfig.label} />
          <StatTile label="sync" value={syncLabel} />
          <StatTile label="course" value={user?.program || 'Not available'} />
          <StatTile label="day order" value={activeDayOrder ? `day ${activeDayOrder}` : 'not set'} />
        </div>
      </GlassCard>

      <section className="space-y-4">
        <SectionHeading
          kicker="appearance"
          title="theme system"
        />

        <GlassCard className="space-y-5 p-5">
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

        <GlassCard className="space-y-3.5 p-5">
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
          <PreferenceRow
            icon={MoonStar}
            title="motion style"
            subtitle={themeConfig.motion.id.replace(/-/g, ' ')}
            motionProps={motionProps}
          />
          <PreferenceRow
            icon={RefreshCw}
            title="day-order source"
            subtitle={dayOrderSource === 'calendar' ? 'calendar linked' : 'manual override'}
            motionProps={motionProps}
            tone={dayOrderSource === 'calendar' ? 'secondary' : 'primary'}
          />
          <PreferenceRow
            icon={ShieldCheck}
            title="privacy"
            subtitle={user?.department || 'session and data'}
            motionProps={motionProps}
          />
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
      className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border p-3.5"
      style={{ borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--surface-soft) 90%, transparent)' }}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn('flex h-10 w-10 items-center justify-center rounded-[16px] border', tone === 'secondary' ? 'text-secondary' : tone === 'primary' ? 'text-primary' : 'text-on-surface-variant')}
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
        <div>
          <h3 className="font-headline text-lg font-bold text-on-surface">{title}</h3>
          <p className="mt-1 text-[13px] leading-5 text-on-surface-variant">{subtitle}</p>
        </div>
      </div>
      {action ?? <ChevronRight size={18} className="shrink-0 text-on-surface-variant" />}
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
      className="flex w-full items-center justify-between gap-4 rounded-[var(--radius-md)] border p-3.5 text-left"
      style={{ borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--surface-soft) 90%, transparent)' }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-[16px] border text-secondary"
          style={{
            borderColor: 'color-mix(in srgb, var(--secondary) 28%, transparent)',
            background: 'color-mix(in srgb, var(--secondary) 12%, transparent)',
          }}
        >
          <Icon size={18} />
        </div>
        <div>
          <h3 className="font-headline text-lg font-bold text-on-surface">{title}</h3>
          <p className="mt-1 text-[13px] leading-5 text-on-surface-variant">{subtitle}</p>
        </div>
      </div>

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
    </motion.button>
  );
}
