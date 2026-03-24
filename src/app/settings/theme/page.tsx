'use client';

import React, { useMemo } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

import AppHeader from '@/components/layout/AppHeader';
import { PageReveal, RevealItem, RevealText } from '@/components/ui/PageReveal';
import { useTheme } from '@/context/ThemeContext';
import { getInteractiveMotion } from '@/lib/motion';
import type { ThemeDefinition } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function ThemeSelectionPage() {
  const { theme, themeConfig, availableThemes, setTheme } = useTheme();
  const motionProps = getInteractiveMotion(themeConfig.motion);
  const groupedThemes = useMemo(
    () => ({
      dark: availableThemes.filter((item) => item.category === 'dark'),
      soft: availableThemes.filter((item) => item.category === 'soft'),
      light: availableThemes.filter((item) => item.category === 'light'),
    }),
    [availableThemes],
  );

  return (
    <PageReveal className="flex min-h-[calc(100dvh-10rem)] flex-col gap-6 pb-36 pt-4">
      <AppHeader backHref="/settings" showBell={false} title="Select Theme" />

      <section className="space-y-3">
        <p className="theme-kicker">appearance</p>
        <h1 className="font-headline text-[clamp(2.6rem,12vw,4.1rem)] font-bold leading-[0.92] text-on-surface">
          full palette list
        </h1>
        <p className="max-w-sm text-sm leading-6 text-on-surface-variant">
          Every theme now includes synced motion and safer contrast tuning for light and soft surfaces.
        </p>
      </section>

      <RevealText>
        <div
          className="rounded-[var(--radius-lg)] border px-4 py-3 text-sm leading-6 text-on-surface-variant"
          style={{ borderColor: 'var(--card-border)', background: 'var(--surface-card-soft)' }}
        >
          Scroll the full list, tap a palette, and the whole app updates instantly.
        </div>
      </RevealText>

      <div className="space-y-6 overflow-y-auto scroll-smooth">
        <ThemeGroup
          title="dark themes"
          subtitle="High-contrast, premium, and glow-forward."
          themes={groupedThemes.dark}
          activeTheme={theme}
          onSelect={setTheme}
          motionProps={motionProps}
        />
        <ThemeGroup
          title="soft themes"
          subtitle="Lighter palettes with stronger text contrast and calmer depth."
          themes={groupedThemes.soft}
          activeTheme={theme}
          onSelect={setTheme}
          motionProps={motionProps}
        />
        {groupedThemes.light.length ? (
          <ThemeGroup
            title="minimal light"
            subtitle="Neutral bright themes that still preserve card separation."
            themes={groupedThemes.light}
            activeTheme={theme}
            onSelect={setTheme}
            motionProps={motionProps}
          />
        ) : null}
      </div>
    </PageReveal>
  );
}

function ThemeGroup({
  title,
  subtitle,
  themes,
  activeTheme,
  onSelect,
  motionProps,
}: {
  title: string;
  subtitle: string;
  themes: ThemeDefinition[];
  activeTheme: string;
  onSelect: (theme: ThemeDefinition['id']) => void;
  motionProps: ReturnType<typeof getInteractiveMotion>;
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-1 px-1">
        <h2 className="font-headline text-2xl font-bold text-on-surface">{title}</h2>
        <p className="text-sm leading-6 text-on-surface-variant">{subtitle}</p>
      </div>

      <div className="space-y-3">
        {themes.map((option) => {
          const active = option.id === activeTheme;

          return (
            <RevealItem key={option.id}>
              <motion.button
                type="button"
                whileHover={motionProps.whileHover}
                whileTap={motionProps.whileTap}
                transition={motionProps.transition}
                onClick={() => onSelect(option.id)}
                className={cn(
                  'flex w-full items-center gap-4 rounded-[999px] border px-4 py-4 text-left',
                  active ? 'shadow-[var(--glow-primary)]' : '',
                )}
                style={{
                  borderColor: active ? 'var(--border-strong)' : 'var(--card-border)',
                  background: active ? 'var(--surface-card-elevated)' : 'var(--surface-card)',
                }}
              >
                <div className="flex gap-2">
                  {option.preview.map((color) => (
                    <span
                      key={color}
                      className="h-4 w-4 rounded-full border border-white/10"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-headline text-lg font-bold text-on-surface">{option.label}</p>
                    {option.isFemaleFocused ? <Sparkles size={14} className="text-secondary" /> : null}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-on-surface-variant">{option.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="hidden rounded-[var(--radius-pill)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant sm:inline-flex"
                    style={{ background: 'var(--surface-card-soft)' }}
                  >
                    {option.category}
                  </span>
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{
                      background: active
                        ? 'color-mix(in srgb, var(--primary) 18%, transparent)'
                        : 'var(--surface-card-soft)',
                      color: active ? 'var(--primary)' : 'var(--text-subtle)',
                    }}
                  >
                    <Check size={16} />
                  </span>
                </div>
              </motion.button>
            </RevealItem>
          );
        })}
      </div>
    </section>
  );
}
