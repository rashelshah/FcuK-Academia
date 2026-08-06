'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Sparkles, X, Gamepad2, Swords, Monitor } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import type { ThemeDefinition, ThemeType } from '@/lib/types';
import { cn } from '@/lib/utils';

type FilterCategory = 'all' | 'dark' | 'soft' | 'minimal';

interface ThemeGalleryBottomSheetProps {
  open: boolean;
  onClose: () => void;
}

// ─── Haptic Feedback ──────────────────────────────────────────────────────────
// Detects Android via User-Agent to avoid calling vibrate on iOS PWA where it
// is either unsupported or produces unintended behavior.
function triggerHaptic(type: 'selection' | 'impact' = 'selection') {
  if (typeof navigator === 'undefined') return;
  const isAndroid = /android/i.test(navigator.userAgent);
  if (!isAndroid) return;
  if (!('vibrate' in navigator)) return;
  try {
    navigator.vibrate(type === 'selection' ? 12 : [12, 40, 18]);
  } catch { /* ignore if blocked */ }
}

// ─── Theme categorisation for the gallery display ─────────────────────────────
// We manage gallery categories here independently of the theme system's
// `category` field so we can correct display groupings without touching
// production theme definitions.

/** IDs that belong to the Minimal gallery section */
const MINIMAL_THEME_IDS: Set<ThemeType> = new Set([
  'minimal-light',
  'retro',
  'mint-gray',
]);

/** IDs that belong to the Soft gallery section */
const SOFT_THEME_IDS: Set<ThemeType> = new Set([
  'soft-bloom',
  'soft-pink-beige',
  'lavender-violet',
  'purple-peach',
  'claymorph',
]);

/** IDs that belong to the Dark gallery section */
const DARK_THEME_IDS: Set<ThemeType> = new Set([
  'neon-lime',
  'cyan-navy',
  'electric-blue',
  'amber-charcoal',
  'graphite-green',
  'orange-noir',
  'neo-brutal-pop',
  'royal-amethyst',
  'arcade',
  'tekken',
  'mission-control',
]);

function getGalleryCategory(id: ThemeType): 'soft' | 'minimal' | 'dark' {
  if (MINIMAL_THEME_IDS.has(id)) return 'minimal';
  if (SOFT_THEME_IDS.has(id)) return 'soft';
  return 'dark';
}

// ─── Premium marble gradient builder ─────────────────────────────────────────
// Produces a multi-layer organic gradient that mimics wallpaper quality —
// flowing marble-like transitions with multiple light sources and depth.
function buildMarbleGradient(preview: string[]): string {
  const c0 = preview[0] ?? '#111';
  const c1 = preview[1] ?? '#444';
  const c2 = preview[2] ?? '#888';
  return [
    // Primary corner bloom — top-left light source
    `radial-gradient(ellipse 90% 70% at 8% 12%, color-mix(in srgb, ${c0} 68%, white 28%) 0%, transparent 68%)`,
    // Secondary depth — bottom-right shadow pool
    `radial-gradient(ellipse 75% 90% at 92% 88%, color-mix(in srgb, ${c1} 85%, black 32%) 0%, transparent 62%)`,
    // Tertiary mid-tone bloom — adds colour diffusion
    `radial-gradient(ellipse 55% 55% at 62% 8%, color-mix(in srgb, ${c2} 52%, white 22%) 0%, transparent 58%)`,
    // Soft inner depth haze
    `radial-gradient(ellipse 80% 65% at 20% 80%, color-mix(in srgb, ${c1} 45%, ${c0} 30%) 0%, transparent 70%)`,
    // Marble vein streak — diagonal colour flow
    `linear-gradient(118deg,
      ${c2} 0%,
      color-mix(in srgb, ${c1} 55%, ${c2} 38%) 28%,
      color-mix(in srgb, ${c0} 62%, ${c1} 28%) 58%,
      color-mix(in srgb, ${c2} 40%, ${c0} 48%) 78%,
      ${c0} 100%
    )`,
  ].join(', ');
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ThemeGalleryBottomSheet({ open, onClose }: ThemeGalleryBottomSheetProps) {
  const { theme, availableThemes, setTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');
  const [isFilterChanging, setIsFilterChanging] = useState(false);
  
  // Entering state for performance deferrals
  const [isEntering, setIsEntering] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lastScrollPosition = useRef<number>(0);
  const scrollLockYRef = useRef<number>(0);

  // ── Reliable iOS & Android Body Scroll Lock ──────────────────────────────
  useEffect(() => {
    if (!open) {
      setIsEntering(false);
      return;
    }
    
    // When opened, immediately enter "isEntering" phase
    setIsEntering(true);
    
    const scrollY = window.scrollY || window.pageYOffset || 0;
    scrollLockYRef.current = scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prev = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
      htmlOverflow: document.documentElement.style.overflow,
    };
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.width = prev.width;
      document.body.style.overflow = prev.overflow;
      document.body.style.paddingRight = prev.paddingRight;
      document.documentElement.style.overflow = prev.htmlOverflow;
      window.scrollTo(0, scrollLockYRef.current);
    };
  }, [open]);

  useEffect(() => {
    if (open && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = lastScrollPosition.current;
    }
  }, [open]);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      lastScrollPosition.current = scrollContainerRef.current.scrollTop;
    }
  }, []);

  // ── Filtered theme list: Soft → Minimal → Dark display order ─────────────
  const filteredThemes = useMemo(() => {
    const all = availableThemes;

    if (selectedFilter === 'soft')    return all.filter((t) => SOFT_THEME_IDS.has(t.id));
    if (selectedFilter === 'minimal') return all.filter((t) => MINIMAL_THEME_IDS.has(t.id));
    if (selectedFilter === 'dark')    return all.filter((t) => DARK_THEME_IDS.has(t.id));

    // "All" — display order: Soft, then Minimal, then Dark
    const soft    = all.filter((t) => SOFT_THEME_IDS.has(t.id));
    const minimal = all.filter((t) => MINIMAL_THEME_IDS.has(t.id));
    const dark    = all.filter((t) => DARK_THEME_IDS.has(t.id));
    return [...soft, ...minimal, ...dark];
  }, [availableThemes, selectedFilter]);

  const currentThemeDef = useMemo(
    () => availableThemes.find((t) => t.id === theme),
    [availableThemes, theme]
  );
  const isCurrentThemeInFilter = useMemo(
    () => filteredThemes.some((t) => t.id === theme),
    [filteredThemes, theme]
  );

  const handleFilterChange = useCallback((category: FilterCategory) => {
    if (category === selectedFilter) return;
    triggerHaptic('selection');
    setIsFilterChanging(true);
    setTimeout(() => {
      setSelectedFilter(category);
      setIsFilterChanging(false);
    }, 75);
  }, [selectedFilter]);

  const handleThemeSelect = useCallback((themeId: ThemeType) => {
    triggerHaptic('selection');
    React.startTransition(() => {
      setTheme(themeId);
    });
  }, [setTheme]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {open ? (
        <div key="tg-portal" className="fixed inset-0 z-[999] flex flex-col justify-end">

          {/* Backdrop Layer 1: Solid Dark (Animates immediately) */}
          <motion.div
            key="tg-backdrop-solid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.08 : 0.18, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/65"
            onClick={onClose}
          />
          {/* Backdrop Layer 2: Blur (Fades in softly after settling) */}
          <motion.div
            key="tg-backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: isEntering ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed inset-0 backdrop-blur-sm pointer-events-none"
          />

          {/* Bottom Sheet */}
          <motion.div
            key="tg-sheet"
            initial={{ y: shouldReduceMotion ? 0 : '100%', opacity: shouldReduceMotion ? 0 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: shouldReduceMotion ? 0 : '100%', opacity: shouldReduceMotion ? 0 : 1 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => setIsEntering(false)}
            drag={shouldReduceMotion ? false : 'y'}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.22 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 400) {
                triggerHaptic('impact');
                onClose();
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Select Theme"
            className="relative z-10 mx-auto flex h-[80dvh] max-h-[84dvh] w-full max-w-[28rem] flex-col overflow-hidden rounded-t-[32px] sm:max-w-[34rem] lg:max-w-[44rem] xl:max-w-[52rem]"
            style={{
              background: 'var(--surface)',
              borderTop: '1px solid color-mix(in srgb, var(--primary) 40%, var(--border-strong))',
              borderLeft: '1px solid color-mix(in srgb, var(--border-strong) 60%, transparent)',
              borderRight: '1px solid color-mix(in srgb, var(--border-strong) 60%, transparent)',
              boxShadow: isEntering
                ? '0 -4px 20px rgba(0,0,0,0.5)'
                : '0 -8px 40px rgba(0,0,0,0.5), 0 0 60px color-mix(in srgb, var(--primary) 12%, transparent)',
              paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
              willChange: isEntering ? 'transform' : 'auto',
            }}
          >
            {/* Drag Handle */}
            <div className="flex shrink-0 items-center justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none">
              <div
                className="h-1 w-9 rounded-full"
                style={{ background: 'color-mix(in srgb, var(--primary) 70%, transparent)' }}
              />
            </div>

            {/* Header */}
            <div className="flex shrink-0 items-start justify-between px-5 pt-2 pb-2">
              <div>
                <h2 className="font-headline text-[1.5rem] font-bold leading-tight text-on-surface">
                  Select Theme
                </h2>
                <p className="mt-0.5 text-[12px] font-medium text-on-surface-variant/60">
                  Choose your vibe
                </p>
              </div>
              <button
                type="button"
                onClick={() => { triggerHaptic('selection'); onClose(); }}
                className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border text-on-surface-variant transition-colors hover:text-on-surface"
                style={{
                  borderColor: 'color-mix(in srgb, var(--border) 50%, transparent)',
                  background: 'color-mix(in srgb, var(--surface-elevated) 70%, transparent)',
                }}
                aria-label="Close Theme Gallery"
              >
                <X size={16} />
              </button>
            </div>

            {/* Filter Segmented Control */}
            <div className="px-5 pb-3 shrink-0">
              <div
                className="flex items-center gap-1 p-1 rounded-full"
                style={{
                  background: 'color-mix(in srgb, var(--surface-elevated) 60%, var(--surface))',
                  border: '1px solid color-mix(in srgb, var(--border) 45%, transparent)',
                }}
              >
                {(['all', 'soft', 'minimal', 'dark'] as const).map((id) => {
                  const label = id.charAt(0).toUpperCase() + id.slice(1);
                  const active = selectedFilter === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleFilterChange(id)}
                      className="relative flex-1 rounded-full py-[7px] text-[12px] transition-colors duration-150"
                      style={{
                        color: active ? 'var(--text-inverse)' : 'var(--text-subtle)',
                        background: active ? 'var(--primary)' : 'transparent',
                        fontWeight: active ? 700 : 500,
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active theme outside filter pill */}
            {!isCurrentThemeInFilter && currentThemeDef && (
              <div
                className="mx-5 mb-2.5 flex shrink-0 items-center justify-between rounded-xl border px-3.5 py-2"
                style={{
                  borderColor: 'color-mix(in srgb, var(--primary) 28%, transparent)',
                  background: 'color-mix(in srgb, var(--primary) 9%, var(--surface-soft))',
                }}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/70">Active:</span>
                  <span className="text-[11px] font-bold capitalize text-primary">{currentThemeDef.label}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleFilterChange('all')}
                  className="text-[11px] font-bold text-primary underline underline-offset-2"
                >
                  Show all
                </button>
              </div>
            )}

            {/* Theme Grid */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className={cn(
                'flex-1 overflow-y-auto overscroll-contain px-4 pb-5 pt-0.5 scrollbar-hide transition-opacity duration-100',
                isFilterChanging ? 'opacity-20 pointer-events-none' : 'opacity-100'
              )}
            >
              <div className="grid grid-cols-3 gap-2.5">
                {filteredThemes.map((option) => (
                  <ThemeGalleryCard
                    key={option.id}
                    option={option}
                    active={option.id === theme}
                    onSelect={handleThemeSelect}
                    shouldReduceMotion={!!shouldReduceMotion}
                    isEntering={isEntering}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

// ─── Card Component ───────────────────────────────────────────────────────────
// Memoised so only the active/inactive card re-renders on selection change.
const ThemeGalleryCard = memo(function ThemeGalleryCard({
  option,
  active,
  onSelect,
  shouldReduceMotion,
  isEntering,
}: {
  option: ThemeDefinition;
  active: boolean;
  onSelect: (theme: ThemeType) => void;
  shouldReduceMotion: boolean;
  isEntering: boolean;
}) {
  const isSpecial = option.id === 'arcade' || option.id === 'tekken' || option.id === 'retro';
  const preview = option.preview ?? ['#111', '#444', '#888'];
  const gradient = useMemo(() => buildMarbleGradient(preview), [preview]);

  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className="group flex flex-col items-center gap-1.5 focus:outline-none min-h-[44px]"
      aria-pressed={active}
      aria-label={`Select ${option.label} theme`}
    >
      {/* ── Card swatch image ── */}
      <div
        className={cn(
          'relative w-full overflow-hidden transition-transform duration-200 ease-out will-change-transform',
          active ? 'scale-[1.04]' : 'group-hover:scale-[1.01]'
        )}
        style={{
          aspectRatio: '1 / 1.05',
          borderRadius: '16px',
          border: active
            ? '2px solid var(--primary)'
            : '1.5px solid color-mix(in srgb, var(--border) 55%, transparent)',
          boxShadow: active
            ? '0 0 0 1px color-mix(in srgb, var(--primary) 30%, transparent), 0 6px 22px rgba(0,0,0,0.38)'
            : '0 3px 12px rgba(0,0,0,0.22)',
        }}
      >
        {isSpecial ? (
          <SpecialThemePreview themeId={option.id} />
        ) : (
          <MarbleGradientSurface
            gradient={gradient}
            active={active}
            shouldReduceMotion={shouldReduceMotion}
            isEntering={isEntering}
          />
        )}

        {/* Sparkles badge */}
        {option.isFemaleFocused && (
          <div
            className="absolute left-1.5 top-1.5 flex items-center justify-center rounded-full p-1"
            style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(6px)' }}
          >
            <Sparkles size={9} className="text-secondary" />
          </div>
        )}

        {/* Checkmark badge — top-right */}
        {active && (
          <div
            className="absolute right-1.5 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full shadow"
            style={{ background: 'var(--primary)', color: 'var(--text-inverse)' }}
          >
            <Check size={11} strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Label — outside/below the card, matching reference */}
      <span
        className={cn(
          'w-full text-center text-[11px] leading-tight transition-colors duration-200',
          active ? 'font-bold text-primary' : 'font-medium text-on-surface/80'
        )}
        style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {option.label}
      </span>
    </button>
  );
});

// ─── Marble Gradient Surface ──────────────────────────────────────────────────
// Extracted so we can apply the living animation without polluting the card.
// Uses CSS @keyframes on transform + opacity for zero-paint GPU animation.
function MarbleGradientSurface({
  gradient,
  active,
  shouldReduceMotion,
  isEntering,
}: {
  gradient: string;
  active: boolean;
  shouldReduceMotion: boolean;
  isEntering: boolean;
}) {
  const animate = !shouldReduceMotion;

  return (
    <div className="absolute inset-0" style={{ background: gradient }}>
      {/*
        ── Overlay 1: flowing curved light band (the "marble vein" highlight) ──
        Animates with a slow opacity + subtle translateY pulse.
        Uses transform + opacity only — zero paint, fully GPU-accelerated.
      */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            // Top-centre soft bloom
            'radial-gradient(ellipse 130% 40% at 50% -5%, rgba(255,255,255,0.28) 0%, transparent 55%)',
            // Bottom-right depth absorber
            'radial-gradient(ellipse 90% 55% at 85% 108%, rgba(0,0,0,0.24) 0%, transparent 60%)',
            // Mid diagonal sheen — the "marble vein"
            'linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.10) 48%, transparent 68%)',
          ].join(', '),
          animation: animate
            ? 'tgLightPulse 15s ease-in-out infinite alternate'
            : 'none',
          animationPlayState: isEntering ? 'paused' : 'running',
          willChange: animate && !isEntering ? 'opacity, transform' : 'auto',
        }}
      />
      {/*
        ── Overlay 2: gentle depth shift ──
        Counter-phase to the first overlay so motion feels organic, not strobe-y.
      */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 70% at 10% 90%, rgba(0,0,0,0.15) 0%, transparent 65%)',
          animation: animate
            ? 'tgDepthShift 18s ease-in-out infinite alternate-reverse'
            : 'none',
          willChange: animate ? 'opacity' : 'auto',
        }}
      />

      {/* Inject keyframes once via a style tag — SSR-safe, deduped by React */}
      <style jsx global>{`
        @keyframes tgLightPulse {
          0%   { opacity: 0.65; transform: translateY(0px) scale(1); }
          40%  { opacity: 0.90; transform: translateY(-1.5px) scale(1.006); }
          100% { opacity: 0.70; transform: translateY(1px) scale(0.997); }
        }
        @keyframes tgDepthShift {
          0%   { opacity: 0.55; }
          60%  { opacity: 0.85; }
          100% { opacity: 0.60; }
        }
      `}</style>
    </div>
  );
}

// ─── Special theme identity previews ─────────────────────────────────────────
function SpecialThemePreview({ themeId }: { themeId: ThemeType }) {
  if (themeId === 'arcade') {
    return (
      <div className="relative w-full h-full bg-[#0A0A0A] flex flex-col justify-between p-2 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-35"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,168,255,0.1) 2px, rgba(0,168,255,0.1) 3px)',
          }}
        />
        <div className="flex items-center justify-between border-b border-[#00A8FF]/30 pb-1">
          <Gamepad2 size={11} className="text-[#00A8FF]" />
          <span className="font-mono text-[8px] font-bold tracking-widest text-[#FFD600]">8-BIT</span>
        </div>
        <div className="flex items-center justify-center gap-2 py-1">
          <span className="h-3 w-3 rounded-full bg-[#FF2E43] shadow-[0_0_6px_#FF2E43]" />
          <span className="h-3 w-3 rounded-full bg-[#00A8FF] shadow-[0_0_6px_#00A8FF]" />
          <span className="h-3 w-3 rounded-full bg-[#FFD600] shadow-[0_0_6px_#FFD600]" />
        </div>
        <div className="text-center font-mono text-[7px] font-bold tracking-widest text-[#00A8FF]">
          INSERT COIN
        </div>
      </div>
    );
  }

  if (themeId === 'tekken') {
    return (
      <div className="relative w-full h-full bg-[#060810] flex flex-col justify-between p-2 overflow-hidden border-t-2 border-[#00D9FF]">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(0,217,255,0.12) 0%, transparent 75%)' }}
        />
        <div className="flex items-center justify-between border-b border-[#3a455b]/60 pb-1">
          <Swords size={11} className="text-[#00D9FF]" />
          <span className="font-mono text-[8px] font-black tracking-widest text-[#FFC629]">TEKKEN</span>
        </div>
        <div className="flex items-center justify-center">
          <span className="text-[22px] font-black italic text-[#FF2A2A] leading-none drop-shadow-[0_0_8px_rgba(255,42,42,0.8)]">
            VS
          </span>
        </div>
        <div className="text-center font-mono text-[7px] font-extrabold tracking-widest text-[#00D9FF]">
          ROUND 1
        </div>
      </div>
    );
  }

  if (themeId === 'retro') {
    return (
      <div
        className="relative w-full h-full bg-[#C0C0C0] flex flex-col overflow-hidden"
        style={{
          borderTop: '2px solid #DFDFDF',
          borderLeft: '2px solid #DFDFDF',
          borderRight: '2px solid #404040',
          borderBottom: '2px solid #404040',
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-1.5 py-[3px] shrink-0"
          style={{ background: 'linear-gradient(90deg, #000080 0%, #1084D0 100%)' }}
        >
          <div className="flex items-center gap-1">
            <Monitor size={9} className="text-white" />
            <span className="text-[8px] font-bold text-white leading-none" style={{ fontFamily: 'MS Sans Serif, Tahoma, sans-serif' }}>Win 95</span>
          </div>
          <div className="flex gap-0.5">
            {(['_', '□', '✕'] as const).map((c) => (
              <span
                key={c}
                className="flex h-3 w-3 items-center justify-center bg-[#C0C0C0] text-[7px] font-bold text-black leading-none"
                style={{ border: '1px solid #808080', boxShadow: 'inset 1px 1px 0 #fff, inset -1px -1px 0 #404040' }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Window body */}
        <div className="flex flex-1 items-center justify-center">
          <div
            className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-black bg-[#C0C0C0]"
            style={{
              fontFamily: 'MS Sans Serif, Tahoma, sans-serif',
              boxShadow: 'inset 2px 2px 0 #fff, inset -2px -2px 0 #404040',
            }}
          >
            OK
          </div>
        </div>

        {/* Taskbar */}
        <div
          className="flex items-center gap-1 px-1 py-0.5 shrink-0"
          style={{
            background: '#C0C0C0',
            borderTop: '1px solid #808080',
            boxShadow: 'inset 0 1px 0 #fff',
          }}
        >
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 text-[7px] font-bold text-black leading-none"
            style={{
              boxShadow: 'inset 2px 2px 0 #fff, inset -2px -2px 0 #404040',
              fontFamily: 'MS Sans Serif, Tahoma, sans-serif',
            }}
          >
            ▶ Start
          </div>
        </div>
      </div>
    );
  }

  return null;
}
