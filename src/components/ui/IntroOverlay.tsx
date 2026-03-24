'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

import { useTheme } from '@/context/ThemeContext';

const BRAND_TEXT = 'Fcuuk Academia';

export default function IntroOverlay() {
  const { showIntro, dismissIntro } = useTheme();
  const [typedCount, setTypedCount] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'revealing'>('typing');
  const typedText = useMemo(() => BRAND_TEXT.slice(0, typedCount), [typedCount]);

  useEffect(() => {
    if (!showIntro || phase !== 'typing') return;

    if (typedCount >= BRAND_TEXT.length) {
      const revealTimer = window.setTimeout(() => {
        setPhase('revealing');
      }, 180);

      return () => window.clearTimeout(revealTimer);
    }

    const typingTimer = window.setTimeout(() => {
      setTypedCount((count) => Math.min(BRAND_TEXT.length, count + 1));
    }, 52);

    return () => window.clearTimeout(typingTimer);
  }, [phase, showIntro, typedCount]);

  useEffect(() => {
    if (!showIntro || phase !== 'revealing') return;

    const dismissTimer = window.setTimeout(() => {
      dismissIntro();
    }, 520);

    return () => window.clearTimeout(dismissTimer);
  }, [dismissIntro, phase, showIntro]);

  return (
    <AnimatePresence>
      {showIntro ? (
        <motion.div
          key="intro-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[140] overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, var(--background) 0%, var(--background-alt) 100%)',
          }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: 'var(--page-gradient)', opacity: 0.96 }}
            animate={{
              scale: phase === 'revealing' ? 1.04 : 1,
              opacity: phase === 'revealing' ? 0.82 : 0.96,
            }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          />

          <motion.div
            className="absolute -left-16 top-[18%] h-40 w-40 rounded-full blur-3xl"
            style={{ background: 'color-mix(in srgb, var(--primary) 40%, transparent)' }}
            animate={{
              x: phase === 'revealing' ? -24 : 0,
              y: phase === 'revealing' ? -12 : 0,
              scale: phase === 'revealing' ? 1.18 : 1,
            }}
            transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="absolute -right-20 bottom-[16%] h-52 w-52 rounded-full blur-3xl"
            style={{ background: 'color-mix(in srgb, var(--secondary) 28%, transparent)' }}
            animate={{
              x: phase === 'revealing' ? 18 : 0,
              y: phase === 'revealing' ? 12 : 0,
              scale: phase === 'revealing' ? 1.14 : 1,
            }}
            transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
          />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{
                opacity: phase === 'revealing' ? 0 : 1,
                y: phase === 'revealing' ? -18 : 0,
                scale: phase === 'revealing' ? 0.98 : 1,
              }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-xl space-y-6"
            >
              <p className="theme-kicker">welcome</p>
              <div className="space-y-3">
                <p
                  className="font-headline text-[clamp(3rem,12vw,5.7rem)] font-black leading-[0.84] text-on-surface"
                  style={{ letterSpacing: '-0.09em', textShadow: 'var(--page-text-shadow)' }}
                >
                  {typedText}
                  <span className="ml-1 inline-block text-primary">|</span>
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-on-surface-variant">
                  academic interface loading
                </p>
              </div>

              <div className="mx-auto h-px w-40 bg-[color:color-mix(in_srgb,var(--primary)_50%,transparent)]" />
            </motion.div>
          </div>

          <motion.div
            initial={{ scale: 0.12, opacity: 0 }}
            animate={{
              scale: phase === 'revealing' ? 18 : 0.12,
              opacity: phase === 'revealing' ? 1 : 0,
            }}
            transition={{ duration: 0.54, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2"
            style={{
              background: 'var(--hero-gradient)',
              borderRadius: '32px',
              boxShadow: 'var(--elevation-strong)',
            }}
          />

          <motion.div
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{
              scale: phase === 'revealing' ? 14 : 0.2,
              opacity: phase === 'revealing' ? 0.2 : 0,
            }}
            transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: 'color-mix(in srgb, var(--primary) 72%, transparent)',
              filter: 'blur(10px)',
            }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
