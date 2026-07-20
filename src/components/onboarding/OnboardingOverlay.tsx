'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import type { OnboardingThemeConfig } from '@/components/onboarding/types';
import { useTheme } from '@/context/ThemeContext';
import { trackEvent } from '@/lib/analytics';

const ONBOARDING_STORAGE_KEY = 'onboardingDone';
const ONBOARDING_PENDING_KEY = 'onboardingPending';

function toRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const full = normalized.length === 3
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized;

  const value = Number.parseInt(full, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export default function OnboardingOverlay() {
  const { dismissIntro, themeConfig, showIntro } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const shouldShow = localStorage.getItem(ONBOARDING_STORAGE_KEY) !== 'true';

      if (shouldShow) {
        setVisible(true);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (visible) {
      document.body.style.overflow = 'hidden';
      trackEvent('onboarding_started', {
        first_time_user: true,
      });
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  const onboardingTheme = useMemo<OnboardingThemeConfig>(() => {
    const background = themeConfig.colors.background;
    const accent = themeConfig.colors.primary;

    return {
      background,
      accent,
      accentSoft: themeConfig.colors.primarySoft,
      accentBorder: toRgba(accent, 0.3),
      accentGlow: toRgba(accent, 0.2),
      accentGlowStrong: toRgba(accent, 0.36),
      cyan: themeConfig.colors.secondary,
      orange: themeConfig.colors.accent,
      text: themeConfig.colors.text,
      textMuted: themeConfig.colors.textMuted,
      textSubtle: themeConfig.colors.textSubtle,
      surface: toRgba('#1b1b1b', 0.94),
      surfaceTop: toRgba('#252525', 0.96),
      surfaceMuted: 'rgba(255,255,255,0.09)',
      surfaceBorder: toRgba('#ffffff', 0.08),
      surfaceShadow: '0 24px 60px rgba(0, 0, 0, 0.36)',
    };
  }, [themeConfig]);

  const handleFinish = () => {
    trackEvent('onboarding_completed', {
      total_steps: 5,
    });
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    document.documentElement.dataset.appVisible = 'true';
    setVisible(false);
    dismissIntro();
  };

  return (
    <AnimatePresence>
      {visible && <OnboardingContainer theme={onboardingTheme} onFinish={handleFinish} />}
    </AnimatePresence>
  );
}
