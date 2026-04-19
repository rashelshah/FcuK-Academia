// ─── Feature Flag ─────────────────────────────────────────────────────────────
/**
 * Master switch for the cinematic intro sequence.
 * Set NEXT_PUBLIC_ENABLE_INTRO_SEQUENCE=true in .env to enable.
 * When false the component never mounts — zero cost.
 */
export const ENABLE_INTRO_SEQUENCE =
  process.env.NEXT_PUBLIC_ENABLE_INTRO_SEQUENCE === 'true';

// ─── Storage Keys ─────────────────────────────────────────────────────────────
export const CINEMATIC_SEEN_KEY    = 'fcuk-cinematic-last-seen-v2';
export const CINEMATIC_VARIANT_KEY = 'fcuk-cinematic-variant-v2';
export const INTRO_24H_MS          = 24 * 60 * 60 * 1_000;

// ─── Rotation Logic ───────────────────────────────────────────────────────────
/**
 * Returns 0 | 1 | 2 — cycles every UTC calendar day.
 * Day 0 → dark, Day 1 → soft, Day 2 → minimal, then repeats.
 * Different users who open the app on different days see different variants.
 */
export function getVariantIndex(): 0 | 1 | 2 | 3 | 4 {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    const raw = sessionStorage.getItem('dev-variant');
    const next = raw ? ((Number(raw) + 1) % 5) : 0;
    sessionStorage.setItem('dev-variant', String(next));
    return next as 0 | 1 | 2 | 3 | 4;
  }
  return (Math.floor(Date.now() / 86_400_000) % 5) as 0 | 1 | 2 | 3 | 4;
}

/** True when no sessionStorage record exists for the current session. */
export function shouldShowCinematic(): boolean {
  if (typeof window === 'undefined') return false;
  
  // ALWAYS show cinematic in development mode (localhost) as requested
  if (process.env.NODE_ENV === 'development') return true;

  try {
    const raw = sessionStorage.getItem(CINEMATIC_SEEN_KEY);
    return !raw;
  } catch {
    return true; // storage unavailable → show intro
  }
}

/** Write a session record so the next refresh within the same tab skips the intro. */
export function markCinematicSeen(variantIndex: number): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CINEMATIC_SEEN_KEY,    'true');
    sessionStorage.setItem(CINEMATIC_VARIANT_KEY, String(variantIndex));
  } catch { /* quota / private-mode — silently skip */ }
}

// ─── Theme Type ───────────────────────────────────────────────────────────────
export interface IntroTheme {
  id: 'dark' | 'soft' | 'minimal';
  /** Full-screen background fill */
  background: string;
  /** Subtle radial overlay on top of background */
  backgroundLayer: string;
  /** Main high-contrast text color */
  textPrimary: string;
  /** Supporting / secondary text color */
  textSecondary: string;
  /** Branded accent (primary) */
  accentPrimary: string;
  /** Branded accent (secondary) */
  accentSecondary: string;
  /** CSS linear-gradient string for gradient text / lines */
  accentGradient: string;
  /** text-shadow string used on glow moments */
  textGlowShadow: string;
  /** Semi-transparent accent used for the ripple rings */
  rippleColor: string;
  /** Scene-3 "PYQs" word color */
  pyqColor: string;
  /** Scene-3 "Notes" word color */
  notesColor: string;
  /** Scene-3 "Everything" gradient (CSS linear-gradient) */
  everythingGradient: string;
  /** Skip button label color (low opacity) */
  skipColor: string;
  /** Scene-2 "LOCK IN" letter color (solid, for contrast) */
  lockColor: string;
  /** Glow box-shadow string for the accent underline */
  underlineGlow: string;
}

// ─── Variant 0 — Clay Morph (Soft/Warm) ──────────────────────────────────────
export const clayMorphTheme: IntroTheme = {
  id:               'soft',
  background:       '#F8EFE9',
  backgroundLayer:  'radial-gradient(ellipse 90% 70% at 40% 50%, rgba(180,114,98,0.1) 0%, transparent 70%)',
  textPrimary:      '#2A1813', // Deep Espresso
  textSecondary:    '#6B5249',
  accentPrimary:    '#B47262', // Clay
  accentSecondary:  '#A495DC', // Soft Purple
  accentGradient:   'linear-gradient(135deg, #B47262 0%, #A495DC 55%, #F1ABBB 100%)',
  textGlowShadow:   '0 2px 28px rgba(180,114,98,0.2)',
  rippleColor:      'rgba(180,114,98,0.3)',
  pyqColor:         '#B47262',
  notesColor:       '#A495DC',
  everythingGradient: 'linear-gradient(135deg, #46312B 0%, #B47262 55%, #F1ABBB 100%)',
  skipColor:        'rgba(42,24,19,0.5)',
  lockColor:        '#2A1813',
  underlineGlow:    '0 0 14px rgba(180,114,98,0.35)',
};

// ─── Variant 1 — Soft Bloom (Soft/Pink) ──────────────────────────────────────
export const softBloomTheme: IntroTheme = {
  id:               'soft',
  background:       '#FFF3F6',
  backgroundLayer:  'radial-gradient(ellipse 90% 70% at 40% 50%, rgba(161,108,245,0.1) 0%, transparent 70%)',
  textPrimary:      '#2E102B', // Deep Midnight Plum
  textSecondary:    '#674F64',
  accentPrimary:    '#A16CF5', // Purple
  accentSecondary:  '#F49DB7', // Petal Pink
  accentGradient:   'linear-gradient(135deg, #A16CF5 0%, #F49DB7 55%, #FFC0A8 100%)',
  textGlowShadow:   '0 2px 28px rgba(161,108,245,0.2)',
  rippleColor:      'rgba(161,108,245,0.3)',
  pyqColor:         '#A16CF5',
  notesColor:       '#F49DB7',
  everythingGradient: 'linear-gradient(135deg, #442842 0%, #A16CF5 55%, #F49DB7 100%)',
  skipColor:        'rgba(46,16,43,0.5)',
  lockColor:        '#2E102B',
  underlineGlow:    '0 0 14px rgba(161,108,245,0.35)',
};

// ─── Variant 2 — Mint Breeze (Soft/Green) ───────────────────────────────────
export const mintBreezeTheme: IntroTheme = {
  id:               'soft',
  background:       '#F0FDF4',
  backgroundLayer:  'radial-gradient(ellipse 90% 70% at 40% 50%, rgba(34,197,94,0.12) 0%, transparent 70%)',
  textPrimary:      '#011111', // Darkened Emerald-Black
  textSecondary:    '#064E3B', 
  accentPrimary:    '#10B981', 
  accentSecondary:  '#6EE7B7',
  accentGradient:   'linear-gradient(135deg, #059669 0%, #34D399 55%, #A7F3D0 100%)',
  textGlowShadow:   '0 2px 28px rgba(16,185,129,0.3)',
  rippleColor:      'rgba(16,185,129,0.3)',
  pyqColor:         '#047857',
  notesColor:       '#059669',
  everythingGradient: 'linear-gradient(135deg, #022C22 0%, #059669 55%, #34D399 100%)',
  skipColor:        'rgba(1,17,17,0.6)',
  lockColor:        '#011111',
  underlineGlow:    '0 0 14px rgba(16,185,129,0.4)',
};

// ─── Variant 3 — Peach Bloom (Soft/Orange) ──────────────────────────────────
export const peachBloomTheme: IntroTheme = {
  id:               'soft',
  background:       '#FFF7ED',
  backgroundLayer:  'radial-gradient(ellipse 90% 70% at 40% 50%, rgba(249,115,22,0.12) 0%, transparent 70%)',
  textPrimary:      '#1C0702', // Darkened Ember-Black
  textSecondary:    '#431407',
  accentPrimary:    '#F97316', 
  accentSecondary:  '#FDBA74',
  accentGradient:   'linear-gradient(135deg, #C2410C 0%, #FB923C 55%, #FED7AA 100%)',
  textGlowShadow:   '0 2px 28px rgba(249,115,22,0.3)',
  rippleColor:      'rgba(249,115,22,0.3)',
  pyqColor:         '#9A3412',
  notesColor:       '#C2410C',
  everythingGradient: 'linear-gradient(135deg, #2A0902 0%, #C2410C 55%, #FB923C 100%)',
  skipColor:        'rgba(28,7,2,0.6)',
  lockColor:        '#1C0702',
  underlineGlow:    '0 0 14px rgba(249,115,22,0.4)',
};

// ─── Variant 4 — Lilac Dream (Soft/Purple) ──────────────────────────────────
export const lilacDreamTheme: IntroTheme = {
  id:               'soft',
  background:       '#FAF5FF',
  backgroundLayer:  'radial-gradient(ellipse 90% 70% at 40% 50%, rgba(168,85,247,0.12) 0%, transparent 70%)',
  textPrimary:      '#1A012A', // Darkened Lilac-Black
  textSecondary:    '#3B0764',
  accentPrimary:    '#A855F7', 
  accentSecondary:  '#D8B4FE',
  accentGradient:   'linear-gradient(135deg, #7E22CE 0%, #C084FC 55%, #E9D5FF 100%)',
  textGlowShadow:   '0 2px 28px rgba(168,85,247,0.3)',
  rippleColor:      'rgba(168,85,247,0.3)',
  pyqColor:         '#6B21A8',
  notesColor:       '#7E22CE',
  everythingGradient: 'linear-gradient(135deg, #26023F 0%, #7E22CE 55%, #C084FC 100%)',
  skipColor:        'rgba(26,1,42,0.6)',
  lockColor:        '#1A012A',
  underlineGlow:    '0 0 14px rgba(168,85,247,0.4)',
};

/** Ordered array — index matches getVariantIndex() output */
export const introThemes: IntroTheme[] = [
  clayMorphTheme,
  softBloomTheme,
  mintBreezeTheme,
  peachBloomTheme,
  lilacDreamTheme,
];
