'use client';

import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { motion, AnimatePresence, useAnimation, type Variants } from 'framer-motion';
import type { IntroTheme } from '@/lib/introConfig';

// ─── Timeline constants (ms from component mount) ─────────────────────────────
const LOCK_IN = ['L', 'O', 'C', 'K', '\u00A0', 'I', 'N'] as const;

const T_S1_START    = 2500;  // scene 0 → 1 (Brand hold 0 -> 2.5s)
const T_S2_START    = 4500;  // scene 1 → 2 (Introducing 2.5 -> 4.5s)
const T_LETTER_0    = 4900;  // first letter reveal (400ms buffer after mount)
const T_LETTER_D    = 100;   // ms per letter interval
const T_PUNCH_ON    = T_LETTER_0 + LOCK_IN.length * T_LETTER_D + 80; // ≈ 5680 (pulse starts)
const T_PUNCH_OFF   = T_PUNCH_ON + 800;                              // ≈ 6480 (pulse ends)
const T_S3_START    = 7500;  // scene 2 → 3 (Lock In hold ~1.4s -> 7.5s total scene)
const T_SUB_1       = 8800;  // PYQs → Notes (1.3s delay)
const T_SUB_2       = 10100; // Notes → Everything (1.3s delay)
const T_S4_START    = 11500; // Features ends (at One place starts at 11.5s)
const T_S5_START    = 13500; // Closing line ends, Ripple starts at 13.5s
const T_COMPLETE    = 15000; // End at 15.0s
const T_HARD        = 16000; // Safety net

// ─── Motion easing presets ────────────────────────────────────────────────────
const EASE_OUT   = [0.25, 0.1, 0.25, 1]    as const;
const EASE_SPRING = [0.34, 1.55, 0.64, 1]  as const;

// ─── Sound Assets ─────────────────────────────────────────────────────────────
const CINEMATIC_SOUNDS = {
  ambient: '/sounds/cinematic-ambient.mp3',
  reveal:  '/sounds/cinematic-reveal.mp3',
  punch:   '/sounds/cinematic-strike.mp3',
  woosh:   '/sounds/cinematic-woosh.mp3',
  outro:   '/sounds/cinematic-outro.mp3',
} as const;

// ─── GradientText helper ──────────────────────────────────────────────────────
function GradientText({
  gradient,
  children,
  style,
}: {
  gradient: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{
        backgroundImage: gradient,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ─── SCENE 0 — "FcuK Academia" ───────────────────────────────────────────────
const Scene0 = memo(function Scene0({ theme }: { theme: IntroTheme }) {
  const useGradient = theme.id !== 'minimal';

  return (
    <motion.div
      key="s0"
      initial={{ opacity: 0, scale: 0.91 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.44, ease: EASE_OUT }}
      style={{ textAlign: 'center', willChange: 'transform, opacity' }}
    >
      {/* FcuK — large brand mark */}
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: EASE_SPRING, staggerChildren: 0.1 }}
        style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: 'clamp(3.5rem, 15vw, 8.5rem)',
          fontWeight: 900,
          lineHeight: 0.88,
          letterSpacing: '-0.04em',
          textShadow: theme.id === 'dark' ? '0 4px 30px rgba(0,0,0,0.6)' : '0 2px 15px rgba(255,255,255,0.4)',
        }}
      >
        {useGradient ? (
          <GradientText gradient={theme.accentGradient}>FcuK</GradientText>
        ) : (
          <span style={{ color: theme.accentPrimary }}>FcuK</span>
        )}
      </motion.div>

      {/* Academia — wide-tracked subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: EASE_OUT }}
        style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: 'clamp(0.9rem, 3.8vw, 1.85rem)',
          fontWeight: 500,
          letterSpacing: '0.44em',
          color: theme.textSecondary,
          textTransform: 'uppercase',
          marginTop: '0.3rem',
          display: 'block',
        }}
      >
        Academia
      </motion.div>

      {/* Accent rule — draws itself in */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8, ease: EASE_OUT }}
        style={{
          marginTop: '1.1rem',
          height: 2.5,
          width: 'clamp(2.5rem, 10vw, 5.5rem)',
          borderRadius: 2,
          background: theme.accentGradient,
          transformOrigin: 'center',
          marginLeft: 'auto',
          marginRight: 'auto',
          boxShadow: theme.id === 'dark' ? '0 0 14px rgba(255,122,24,0.55)' : 'none',
        }}
      />
    </motion.div>
  );
});
Scene0.displayName = 'Scene0';

// ─── SCENE 1 — "Introducing" ──────────────────────────────────────────────────
const Scene1 = memo(function Scene1({ theme }: { theme: IntroTheme }) {
  return (
    <motion.div
      key="s1"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.36, ease: EASE_OUT }}
      style={{ textAlign: 'center', willChange: 'transform, opacity' }}
    >
      {/* Accent dot */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: EASE_SPRING }}
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: theme.accentPrimary,
          margin: '0 auto 1.1rem',
          boxShadow:
            theme.id === 'dark'
              ? '0 0 16px rgba(255,122,24,0.75), 0 0 32px rgba(255,122,24,0.3)'
              : theme.id === 'soft'
              ? '0 0 12px rgba(161,108,245,0.55)'
              : 'none',
        }}
      />

      {/* Word */}
      <div
        style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: 'clamp(0.85rem, 3.8vw, 1.7rem)',
          fontWeight: 400,
          letterSpacing: '0.58em',
          textTransform: 'uppercase',
          color: theme.textSecondary,
          textShadow: theme.id === 'dark' ? '0 2px 15px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        Introducing
      </div>

      {/* Thin line below */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: EASE_OUT }}
        style={{
          marginTop: '1rem',
          height: 1,
          width: 'clamp(2rem, 8vw, 4rem)',
          background: theme.textSecondary,
          opacity: 0.3,
          transformOrigin: 'center',
          marginLeft: 'auto',
          marginRight: 'auto',
          borderRadius: 1,
        }}
      />
    </motion.div>
  );
});
Scene1.displayName = 'Scene1';

// ─── SCENE 2 — "LOCK IN" (cinematic letter reveal) ────────────────────────────
interface Scene2Props {
  theme: IntroTheme;
  letterIndex: number;
  showPunch: boolean;
}

const Scene2 = memo(function Scene2({ theme, letterIndex, showPunch }: Scene2Props) {
  const controls = useAnimation();
  const allRevealed = letterIndex >= LOCK_IN.length;

  useEffect(() => {
    if (showPunch) {
      controls.start({
        scale: [1, 1.08, 0.99, 1.02],
        rotateX: [0, 8, -4, 0],   // Subtle 3D tilt
        rotateY: [0, -5, 3, 0],
        transition: { duration: 0.9, ease: EASE_SPRING },
      });
    }
  }, [showPunch, controls]);

  return (
    <motion.div
      key="s2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
      style={{ textAlign: 'center', willChange: 'transform, opacity' }}
    >
      {/* Letter row */}
      <motion.div animate={controls} style={{ display: 'inline-flex', alignItems: 'baseline' }}>
        {LOCK_IN.map((char, i) => {
          const visible = i < letterIndex;
          const isSpace = char === '\u00A0';

          // Color per theme for maximum readability & pop
          const charColor = visible
            ? theme.lockColor
            : 'transparent';

          return (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 22 }}
              animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
              transition={{ duration: 0.24, ease: EASE_SPRING }}
              style={{
                fontFamily: '"Evaco", "Space Grotesk", sans-serif',
                fontSize: 'clamp(3.0rem, 14vw, 6.8rem)',
                fontWeight: 900,
                lineHeight: 0.88,
                letterSpacing: isSpace ? '0.05em' : '-0.03em',
                display: 'inline-block',
                willChange: 'transform, opacity',
                color: charColor,
                // Aggressive protective shadow
                textShadow: theme.id === 'dark' 
                  ? '0 10px 40px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8)' 
                  : '0 2px 20px rgba(255,255,255,0.8)',
              }}
            >
              {char}
            </motion.span>
          );
        })}
      </motion.div>

      {/* Gradient underline — draws in after all letters appear */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={allRevealed ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.42, ease: EASE_OUT }}
        style={{
          marginTop: '0.55rem',
          height: 3,
          background: theme.accentGradient,
          borderRadius: 3,
          transformOrigin: 'left',
          boxShadow: theme.underlineGlow,
        }}
      />
    </motion.div>
  );
});
Scene2.displayName = 'Scene2';

// ─── SCENE 3 — PYQs / Notes / Everything ──────────────────────────────────────
const SUB_SCENES = [
  { label: 'PYQs',       tag: 'Past Year',  key: 'pyqs'  },
  { label: 'Notes',      tag: 'Curated',    key: 'notes' },
  { label: 'Everything', tag: 'All In One', key: 'every' },
] as const;

type SubKey = typeof SUB_SCENES[number]['key'];

const SUB_VARIANTS: Record<SubKey, Variants> = {
  pyqs: {
    hidden:  { opacity: 0, x: -58 },
    visible: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: 44, transition: { duration: 0.4 } },
  },
  notes: {
    hidden:  { opacity: 0, x: 58 },
    visible: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -44, transition: { duration: 0.4 } },
  },
  every: {
    hidden:  { opacity: 0, scale: 0.82 },
    visible: { opacity: 1, scale: 1 },
    exit:    { opacity: 0, scale: 1.06, transition: { duration: 0.4 } },
  },
};

const Scene3 = memo(function Scene3({
  theme,
  subScene,
}: {
  theme: IntroTheme;
  subScene: 0 | 1 | 2;
}) {
  const current  = SUB_SCENES[subScene];
  const vk       = current.key;
  const isEverything = subScene === 2;
  const wordColor = subScene === 0 ? theme.pyqColor : subScene === 1 ? theme.notesColor : null;

  return (
    <motion.div
      key="s3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      style={{ textAlign: 'center', minWidth: '55vw', willChange: 'opacity' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={vk}
          variants={SUB_VARIANTS[vk]}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.26, ease: EASE_OUT }}
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Main word */}
          <div
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: 'clamp(3.0rem, 14vw, 7.5rem)', // Scaled down for fit
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              textShadow: theme.id === 'dark' ? '0 5px 35px rgba(0,0,0,0.7)' : '0 2px 15px rgba(255,255,255,0.5)',
              ...(isEverything
                ? {
                    backgroundImage: theme.everythingGradient,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent',
                  }
                : {
                    color: wordColor ?? theme.textPrimary,
                    textShadow:
                      theme.id === 'dark' && wordColor
                        ? `0 0 22px ${wordColor}88, 0 0 48px ${wordColor}28`
                        : 'none',
                  }),
            }}
          >
            {current.label}
          </div>

          {/* Descriptor tag with flanking dashes */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(0.4rem, 2vw, 0.8rem)',
              marginTop: '0.9rem',
            }}
          >
            <div
              style={{
                width: 'clamp(1.2rem, 4.5vw, 2.2rem)',
                height: 1.5,
                background: wordColor ?? theme.accentPrimary,
                borderRadius: 2,
                opacity: 0.65,
              }}
            />
            <span
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: 'clamp(0.65rem, 2.3vw, 0.85rem)',
                letterSpacing: '0.36em',
                textTransform: 'uppercase',
                color: theme.textSecondary,
                fontWeight: 600,
              }}
            >
              {current.tag}
            </span>
            <div
              style={{
                width: 'clamp(1.2rem, 4.5vw, 2.2rem)',
                height: 1.5,
                background: wordColor ?? theme.accentPrimary,
                borderRadius: 2,
                opacity: 0.65,
              }}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
});
Scene3.displayName = 'Scene3';

// ─── SCENE 4 — "at One place" ─────────────────────────────────────────────────
const Scene4 = memo(function Scene4({ theme }: { theme: IntroTheme }) {
  return (
    <motion.div
      key="s4"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 1.2, ease: EASE_OUT }}
      style={{ textAlign: 'center', willChange: 'transform, opacity' }}
    >
      {/* "— at —" divider */}
      <div
        style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: 'clamp(0.68rem, 2.4vw, 0.95rem)',
          letterSpacing: '0.52em',
          textTransform: 'uppercase',
          color: theme.textSecondary,
          fontWeight: 500,
          opacity: 0.7,
          marginBottom: '0.45rem',
        }}
      >
        — at —
      </div>

      {/* "One Place" */}
      <div
        style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: 'clamp(3.5rem, 15vw, 7.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 0.92,
          color: theme.textPrimary,
          textShadow: theme.id === 'dark' 
            ? `0 10px 50px rgba(0,0,0,0.9), ${theme.textGlowShadow}` 
            : '0 2px 20px rgba(255,255,255,0.6)',
        }}
      >
        One Place
      </div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: 'clamp(0.62rem, 2.4vw, 0.84rem)',
          color: theme.textSecondary,
          letterSpacing: '0.08em',
          marginTop: '0.85rem',
          fontStyle: 'italic',
          opacity: 0.8,
        }}
      >
        for the ones who lock in.
      </motion.div>
    </motion.div>
  );
});
Scene4.displayName = 'Scene4';

// ─── SCENE 5 — Ripple Dissolve ────────────────────────────────────────────────
const RippleScene = memo(function RippleScene({ theme }: { theme: IntroTheme }) {
  return (
    <motion.div
      key="ripple"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.88, delay: 0.05, ease: EASE_OUT }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '28vmin',
            height: '28vmin',
            borderRadius: '50%',
            border: `1.5px solid ${theme.rippleColor}`,
            animation: `fcukRipple 1.8s ease-out ${i * 250}ms forwards`,
          }}
        />
      ))}
    </motion.div>
  );
});
RippleScene.displayName = 'RippleScene';

// ─── Main CinematicIntro ──────────────────────────────────────────────────────
interface CinematicIntroProps {
  theme: IntroTheme;
  onComplete: () => void;
}

export default function CinematicIntro({ theme, onComplete }: CinematicIntroProps) {
  const [scene,       setScene]       = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [letterIndex, setLetterIndex] = useState(0);
  const [subScene,    setSubScene]    = useState<0 | 1 | 2>(0);
  const [showPunch,   setShowPunch]   = useState(false);
  const [fading,      setFading]      = useState(false);

  const completedRef  = useRef(false);
  const timersRef     = useRef<ReturnType<typeof setTimeout>[]>([]);
  const fadeTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Audio handles
  const ambientRef = useRef<HTMLAudioElement | null>(null);

  const playSFX = useCallback((path: string, volume = 0.6) => {
    try {
      const audio = new Audio(path);
      audio.volume = volume;
      audio.play().catch(() => {/* Autoplay restricted */});
    } catch { /* Silent fail */ }
  }, []);

  const stopAllAudio = useCallback(() => {
    if (ambientRef.current) {
      ambientRef.current.pause();
      ambientRef.current = null;
    }
  }, []);

  const safeComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    stopAllAudio();
    timersRef.current.forEach(clearTimeout);
    setFading(true);
    fadeTimerRef.current = setTimeout(onComplete, 380);
  }, [onComplete, stopAllAudio]);

  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = [];
    timersRef.current = t;
    const add = (fn: () => void, ms: number) => t.push(setTimeout(fn, ms));

    // Scene transitions
    add(() => {
      setScene(0);
      playSFX(CINEMATIC_SOUNDS.reveal, 0.35); // Softer reveal
      
      // Start Ambient backdrop (deep dark drone)
      try {
        const amb = new Audio(CINEMATIC_SOUNDS.ambient);
        amb.loop = true;
        amb.volume = 0.1; // Sub-audible atmospheric bed
        amb.play().catch(() => {});
        ambientRef.current = amb;
      } catch {}
    }, 0);

    add(() => setScene(1), T_S1_START);
    add(() => { setScene(2); setLetterIndex(0); }, T_S2_START);

    // Letter reveals
    LOCK_IN.forEach((_, i) => {
      add(() => setLetterIndex(i + 1), T_LETTER_0 + i * T_LETTER_D);
    });

    // Scale punch
    add(() => {
      setShowPunch(true);
      playSFX(CINEMATIC_SOUNDS.punch, 0.85); // High impact punch
    }, T_PUNCH_ON);
    add(() => setShowPunch(false), T_PUNCH_OFF);

    // Scene 3 + subscenes
    add(() => { setScene(3); setSubScene(0); playSFX(CINEMATIC_SOUNDS.woosh, 0.4); }, T_S3_START);
    add(() => { setSubScene(1); playSFX(CINEMATIC_SOUNDS.woosh, 0.4); }, T_SUB_1);
    add(() => { setSubScene(2); playSFX(CINEMATIC_SOUNDS.woosh, 0.4); }, T_SUB_2);

    // Scene 4 + ripple
    add(() => { setScene(4); playSFX(CINEMATIC_SOUNDS.woosh, 0.35); }, T_S4_START);
    add(() => { setScene(5); playSFX(CINEMATIC_SOUNDS.outro, 1.0); }, T_S5_START);

    // Complete + hard-timeout
    add(safeComplete, T_COMPLETE);
    add(safeComplete, T_HARD);

    return () => {
      t.forEach(clearTimeout);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [safeComplete]);

  const isDark = theme.id === 'dark';

  return (
    <>
      {/* Ripple keyframe + ambient blob keyframes — all on GPU compositor ──────────────
       * Blobs animate via transform only (no layout, no paint triggers).
       * prefers-reduced-motion: blobs are static (animation: none).
       * No blur — safe for low-end Android.
       ─────────────────────────────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes fcukRipple {
          0%   { transform: scale(0.1); opacity: 0.9; }
          55%  { opacity: 0.5; }
          100% { transform: scale(5.5); opacity: 0; }
        }
        @keyframes fcukAliveGradient {
          0% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-30%, -30%, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @font-face {
          font-family: 'Evaco';
          src: url('/font/Evaco-aYvzJ.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        @media (prefers-reduced-motion: reduce) {
          .fcuk-alive-gradient { animation: none !important; }
        }
      `}</style>

      {/* ── Full-screen fixed backdrop ── */}
      <div
        aria-label="Cinematic intro"
        role="presentation"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 155,
          width: '100vw',
          height: '100dvh',
          overflow: 'hidden',
          background: theme.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: fading ? 0 : 1,
          transition: 'opacity 0.38s ease',
        }}
      >
        {/* Ambient glow layer */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: theme.backgroundLayer,
            pointerEvents: 'none',
          }}
        />

        {/* ── Alive Mesh Background ──────────────────────────────────────────────────
         * Full-bleed animated gradient using raw theme colors to create a painted,
         * shifting aesthetic. Performance is strictly nailed through transform3d.
         ─────────────────────────────────────────────────────────────────────────── */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
          }}
        >
          <div
            className="fcuk-alive-gradient"
            style={{
              position: 'absolute',
              width: '200vw',   /* Giant canvas for translate3d dragging */
              height: '200vh', 
              top: '0', 
              left: '0',
              background: `linear-gradient(-45deg, ${theme.accentPrimary}, ${theme.background}, ${theme.accentSecondary}, ${theme.background}, ${theme.accentPrimary})`,
              backgroundSize: '100% 100%',
              animation: 'fcukAliveGradient 20s ease-in-out infinite',
              pointerEvents: 'none',
              willChange: 'transform',
            }}
          />
        </div>

        {/* Film-grain texture (all themes for cinematic texture, NO mixBlendMode lag) */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: -20,
            opacity: isDark ? 0.08 : 0.05,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '150px 150px',
            pointerEvents: 'none',
            mixBlendMode: 'normal',
          }}
        />

        {/* ── Scene content — centred, full-width, no max-width cap ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            padding: '0 clamp(1.5rem, 6vw, 5rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AnimatePresence mode="wait">
            {scene === 0 && <Scene0 key="s0" theme={theme} />}
            {scene === 1 && <Scene1 key="s1" theme={theme} />}
            {scene === 2 && (
              <Scene2
                key="s2"
                theme={theme}
                letterIndex={letterIndex}
                showPunch={showPunch}
              />
            )}
            {scene === 3 && (
              <Scene3 key="s3" theme={theme} subScene={subScene} />
            )}
            {scene === 4 && <Scene4 key="s4" theme={theme} />}
          </AnimatePresence>
        </div>

        {/* Ripple scene — outside main AnimatePresence to prevent positioning clash */}
        <AnimatePresence>
          {scene === 5 && <RippleScene key="ripple" theme={theme} />}
        </AnimatePresence>

        {/* ── Skip button ── */}
        <button
          type="button"
          onClick={safeComplete}
          aria-label="Skip intro"
          style={{
            position: 'absolute',
            top: 'clamp(0.75rem, 2.5vw, 1.25rem)',
            right: 'clamp(0.75rem, 2.5vw, 1.25rem)',
            zIndex: 10,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.55rem 0.85rem',
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 'clamp(0.58rem, 1.8vw, 0.7rem)',
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: theme.skipColor,
            transition: 'color 0.22s ease',
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none',
          }}
          onPointerEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = theme.textSecondary;
          }}
          onPointerLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = theme.skipColor;
          }}
        >
          skip →
        </button>
      </div>
    </>
  );
}
