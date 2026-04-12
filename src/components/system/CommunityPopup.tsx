'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircleMore } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useTheme } from '@/context/ThemeContext';
import { getInteractiveMotion } from '@/lib/motion';
import { FEATURES, WHATSAPP_COMMUNITY_POPUP_CONFIG } from '@/lib/features';
import { cn } from '@/lib/utils';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

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

function isCooldownActive() {
  const lastShownAt = window.localStorage.getItem(WHATSAPP_COMMUNITY_POPUP_CONFIG.cooldownKey);

  if (!lastShownAt) return false;

  const parsedTimestamp = Number(lastShownAt);
  if (Number.isNaN(parsedTimestamp)) return false;

  return (Date.now() - parsedTimestamp) < WHATSAPP_COMMUNITY_POPUP_CONFIG.cooldownMs;
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1);
}

function isDevPreviewMode() {
  return process.env.NODE_ENV !== 'production';
}

export default function CommunityPopup() {
  const { showIntro, themeConfig } = useTheme();
  const motionProps = getInteractiveMotion(themeConfig.motion);
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const hasOpenedRef = useRef(false);
  const titleId = useId();
  const descriptionId = useId();
  const portalTarget = typeof document === 'undefined' ? null : document.body;

  useEffect(() => {
    if (!FEATURES.WHATSAPP_COMMUNITY_POPUP || typeof window === 'undefined') return;
    if (showIntro) return;
    if (hasOpenedRef.current) return;

    const devPreviewMode = isDevPreviewMode();

    const hasSeenInSession = window.sessionStorage.getItem(WHATSAPP_COMMUNITY_POPUP_CONFIG.sessionKey) === 'true';
    if (hasSeenInSession && !devPreviewMode) return;

    const onboardingPending = window.sessionStorage.getItem('onboardingPending') === 'true';
    if (onboardingPending && !devPreviewMode) {
      window.sessionStorage.setItem(WHATSAPP_COMMUNITY_POPUP_CONFIG.sessionKey, 'true');
      return;
    }

    if (isCooldownActive() && !devPreviewMode) {
      window.sessionStorage.setItem(WHATSAPP_COMMUNITY_POPUP_CONFIG.sessionKey, 'true');
      return;
    }

    window.sessionStorage.setItem(WHATSAPP_COMMUNITY_POPUP_CONFIG.sessionKey, 'true');
    if (!devPreviewMode) {
      window.localStorage.setItem(
        WHATSAPP_COMMUNITY_POPUP_CONFIG.cooldownKey,
        String(Date.now()),
      );
    }

    const openTimer = window.setTimeout(() => {
      hasOpenedRef.current = true;
      setOpen(true);
    }, 850);

    return () => window.clearTimeout(openTimer);
  }, [showIntro]);

  useEffect(() => {
    if (!open) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      const focusable = getFocusableElements(modalRef.current);
      focusable[0]?.focus();
    }, 30);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements(modalRef.current);
      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [open]);

  if (!FEATURES.WHATSAPP_COMMUNITY_POPUP) {
    return null;
  }

  const { colors, elevation, glow, radius, motion: themeMotion } = themeConfig;
  const backdropStyle = {
    background: `linear-gradient(180deg, ${toRgba(colors.background, 0.48)} 0%, ${toRgba(colors.backgroundAlt, 0.8)} 100%)`,
    backdropFilter: 'blur(18px)',
  };
  const panelStyle = {
    color: colors.text,
    borderColor: toRgba(colors.accent, 0.22),
    borderRadius: radius.xl,
    background: `linear-gradient(180deg, ${toRgba(colors.surfaceElevated, 0.88)} 0%, ${toRgba(colors.surface, 0.94)} 100%)`,
    boxShadow: `${elevation.floating}, 0 0 0 1px ${toRgba(colors.primary, 0.08)}, 0 0 40px ${toRgba(colors.accent, 0.18)}`,
  } as const;
  const accentOrbStyle = {
    background: `radial-gradient(circle, ${toRgba(colors.accent, 0.42)} 0%, ${toRgba(colors.primary, 0.12)} 44%, transparent 76%)`,
  };
  const primaryButtonStyle = {
    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
    color: colors.textInverse,
    boxShadow: glow.accent,
  } as const;
  const secondaryButtonStyle = {
    background: toRgba(colors.surfaceHighlight, 0.76),
    color: colors.text,
    borderColor: toRgba(colors.primary, 0.18),
  } as const;

  if (!portalTarget) {
    return null;
  }

  return createPortal((
    <AnimatePresence>
      {open ? (
        <motion.div
          key="community-popup-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6"
          style={backdropStyle}
          onClick={(event) => {
            // Dismissal via backdrop click disabled by request
          }}
        >
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            initial={{ opacity: 0, scale: 0.92, y: 22 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{
              duration: Math.max(0.24, themeMotion.reveal.duration),
              ease: EASE_OUT,
            }}
            className="relative mx-auto min-w-0 w-full max-w-[calc(100vw-2rem)] sm:max-w-sm overflow-hidden border px-5 py-5 sm:px-6 sm:py-6"
            style={panelStyle}
          >
            <div className="pointer-events-none absolute inset-0 opacity-90" style={{ background: themeConfig.effects.surfaceGradient }} />
            <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full blur-2xl" style={accentOrbStyle} />
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${toRgba(colors.primarySoft, 0.85)}, transparent)` }} />

            <div className="relative z-10 flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px]"
                  style={{
                    background: `linear-gradient(135deg, ${toRgba(colors.primary, 0.22)} 0%, ${toRgba(colors.accent, 0.28)} 100%)`,
                    boxShadow: `0 0 24px ${toRgba(colors.accent, 0.18)}`,
                  }}
                >
                  <MessageCircleMore size={22} style={{ color: colors.text }} />
                </div>

                <div className="min-w-0">
                  <p className="font-label text-[10px] font-bold uppercase tracking-[0.26em]" style={{ color: colors.primarySoft }}>
                    community drop
                  </p>
                  <h2 id={titleId} className="mt-2 font-headline text-[2rem] font-bold leading-[0.88] tracking-tight">
                    join the gng 💬
                  </h2>
                </div>
              </div>

              <p
                id={descriptionId}
                className="max-w-[24ch] text-sm leading-6 sm:text-[0.95rem]"
                style={{ color: colors.textMuted }}
              >
                get updates, bug fixes, and random chaos from us.
              </p>

              <div className="grid grid-cols-1 gap-3">
                <motion.button
                  type="button"
                  whileHover={motionProps.whileHover}
                  whileTap={motionProps.whileTap}
                  transition={motionProps.transition}
                  className={cn(
                    'inline-flex min-h-12 w-full items-center justify-center rounded-full px-5 py-3 text-center font-label text-[11px] font-bold uppercase tracking-[0.18em]',
                    'transition-[transform,box-shadow,filter] duration-200',
                  )}
                  style={primaryButtonStyle}
                  onClick={() => {
                    window.open(WHATSAPP_COMMUNITY_POPUP_CONFIG.whatsappUrl, '_blank', 'noopener,noreferrer');
                    setOpen(false);
                  }}
                >
                  join on whatsapp →
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={motionProps.whileHover}
                  whileTap={motionProps.whileTap}
                  transition={motionProps.transition}
                  className={cn(
                    'inline-flex min-h-12 w-full items-center justify-center rounded-full border px-5 py-3 text-center font-label text-[11px] font-bold uppercase tracking-[0.18em]',
                    'transition-[transform,box-shadow,border-color] duration-200',
                  )}
                  style={secondaryButtonStyle}
                  onClick={() => setOpen(false)}
                >
                  maybe later
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  ), portalTarget);
}
