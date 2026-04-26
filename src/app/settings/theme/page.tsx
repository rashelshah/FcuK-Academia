'use client';

import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import AppHeader from '@/components/layout/AppHeader';
import { PageReveal, RevealItem, RevealText } from '@/components/ui/PageReveal';
import { useTheme } from '@/context/ThemeContext';
import { getInteractiveMotion } from '@/lib/motion';
import type { ThemeDefinition, ThemeType } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function ThemeSelectionPage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
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

  const handleThemeSelect = (themeId: ThemeType) => {
    if (themeId === theme) {
      router.back();
      return;
    }

    setTheme(themeId);
    
    // Snappy production-level sequence
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        router.back();
      }, 250); // Matches the fast exit animation
    }, 200); // Very brief pause to see the selection
  };

  return (
    <AnimatePresence mode="wait">
      {!isExiting && (
        <motion.div
          key="theme-content"
          initial={{ opacity: 1, scale: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 0.92,
            y: 20,
            transition: { 
              duration: 0.25, 
              ease: [0.32, 0, 0.67, 0] // Fast acceleration out
            } 
          }}
          className="flex min-h-[calc(100dvh-10rem)] flex-col gap-6 pb-36 pt-4"
        >
          <PageReveal className="flex flex-col gap-6">
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
                onSelect={handleThemeSelect}
                isExiting={isExiting}
                motionProps={motionProps}
              />
              <ThemeGroup
                title="soft themes"
                subtitle="Lighter palettes with stronger text contrast and calmer depth."
                themes={groupedThemes.soft}
                activeTheme={theme}
                onSelect={handleThemeSelect}
                isExiting={isExiting}
                motionProps={motionProps}
              />
              {groupedThemes.light.length ? (
                <ThemeGroup
                  title="minimal light"
                  subtitle="Neutral bright themes that still preserve card separation."
                  themes={groupedThemes.light}
                  activeTheme={theme}
                  onSelect={handleThemeSelect}
                  isExiting={isExiting}
                  motionProps={motionProps}
                />
              ) : null}
            </div>
          </PageReveal>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ThemeGroup({
  title,
  subtitle,
  themes,
  activeTheme,
  onSelect,
  isExiting,
  motionProps,
}: {
  title: string;
  subtitle: string;
  themes: ThemeDefinition[];
  activeTheme: string;
  onSelect: (theme: ThemeType) => void;
  isExiting: boolean;
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
                whileHover={isExiting ? {} : motionProps.whileHover}
                whileTap={isExiting ? {} : motionProps.whileTap}
                transition={motionProps.transition}
                onClick={() => onSelect(option.id)}
                disabled={isExiting}
                className={cn(
                  'flex w-full items-center gap-4 rounded-[999px] border px-4 py-4 text-left transition-all duration-300',
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
