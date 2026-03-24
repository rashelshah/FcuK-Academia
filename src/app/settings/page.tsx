'use client';

import React, { useMemo, useState } from 'react';
import { Bell, School, ShieldCheck, RefreshCw, LogOut, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useTheme } from '@/context/ThemeContext';
import { ThemeType } from '@/lib/types';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import DayOrderSelector from '@/components/settings/DayOrderSelector';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';

const themeOptions = [
  { id: 'dark' as ThemeType, label: 'default dark', colors: ['#000', '#e9ffbd'] },
  { id: 'neon' as ThemeType, label: 'neon brutal', colors: ['#00e0ff', '#ff7168'] },
  { id: 'light' as ThemeType, label: 'light minimal', colors: ['#fff', '#222'] },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, loading } = useUser();
  const router = useRouter();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const syncLabel = useMemo(() => {
    if (loading) return 'syncing live account data';
    if (!user) return 'session expired';
    return `semester ${user.semester} • batch ${user.batch}`;
  }, [loading, user]);

  async function handleLogout() {
    setLogoutLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div className="flex items-end gap-4">
          <h2 className="font-headline text-4xl font-bold lowercase tracking-tighter text-primary">visual core</h2>
          <div className="h-[2px] flex-1 bg-surface-high mb-3"></div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {themeOptions.map((opt) => (
            <GlassCard
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={cn(
                'cursor-pointer border-2 transition-all',
                theme === opt.id ? 'border-primary neon-glow' : 'border-outline/10 hover:border-outline/50',
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="font-headline text-lg font-bold lowercase">{opt.label}</span>
                <div className="flex gap-1">
                  {opt.colors.map((c, i) => (
                    <div key={i} className="w-4 h-4 rounded-full border border-outline/20" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="aspect-video bg-background rounded-lg mb-4 flex items-center justify-center border border-outline/10">
                <div className="w-12 h-2 bg-primary rounded-full animate-glow-pulse" />
              </div>
              <p className={cn('text-xs font-label uppercase tracking-widest', theme === opt.id ? 'text-primary' : 'text-on-surface-variant')}>
                {theme === opt.id ? 'selected' : 'activate'}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section>
        <DayOrderSelector />
      </section>

      <section className="space-y-6">
        <h2 className="font-headline text-4xl font-bold lowercase tracking-tighter text-secondary">preferences</h2>
        <div className="space-y-3">
          <PreferenceItem icon={Bell} title="notifications" subtitle={user?.mobile || 'stay updated on class alerts'} hasToggle />
          <PreferenceItem icon={School} title="course details" subtitle={user?.program || 'syllabus and credit management'} />
          <PreferenceItem icon={ShieldCheck} title="privacy" subtitle={user?.department || 'manage data and visibility'} />
          <PreferenceItem icon={RefreshCw} title="sync" subtitle={syncLabel} actionIcon />
        </div>
      </section>

      <section className="pt-8 text-center space-y-6">
        <Button variant="brutalist" fullWidth onClick={handleLogout} disabled={logoutLoading}>
          <LogOut size={32} />
          {logoutLoading ? 'logging out...' : 'abort mission / logout'}
        </Button>
        <p className="text-on-surface-variant font-label uppercase tracking-widest text-[10px] opacity-40">
          {user ? `${user.name.toLowerCase()} • ${user.regNumber}` : 'live SRM session'}
        </p>
      </section>
    </div>
  );
}

interface PreferenceItemProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  hasToggle?: boolean;
  actionIcon?: boolean;
}

function PreferenceItem({ icon: Icon, title, subtitle, hasToggle, actionIcon }: PreferenceItemProps) {
  return (
    <GlassCard className="p-6 flex items-center justify-between group cursor-pointer hover:bg-surface-high/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
          hasToggle ? 'bg-secondary/10 text-secondary' : 'bg-surface-highest text-on-surface-variant group-hover:text-primary',
        )}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-bold text-on-surface">{title}</h3>
          <p className="text-sm text-on-surface-variant">{subtitle}</p>
        </div>
      </div>
      {hasToggle ? (
        <div className="w-12 h-6 bg-secondary rounded-full flex items-center px-1">
          <div className="w-4 h-4 bg-background rounded-full ml-auto" />
        </div>
      ) : actionIcon ? (
        <RefreshCw size={20} className="text-on-surface-variant" />
      ) : (
        <ChevronRight size={20} className="text-on-surface-variant" />
      )}
    </GlassCard>
  );
}
