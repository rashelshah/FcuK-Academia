import { motionPresets } from '@/lib/motion';
import { ThemeDefinition, ThemeType } from '@/lib/types';

export const defaultTheme: ThemeType = 'neon-lime';
export const THEME_STORAGE_KEY = 'fcuk-academia-theme';
export const THEME_COOKIE_KEY = 'fcuk-academia-theme';
export const INTRO_STORAGE_KEY = 'fcuk-academia-intro-seen';

export const themeOrder: ThemeType[] = [
  'neon-lime',
  'cyan-navy',
  'electric-blue',
  'amber-charcoal',
  'graphite-green',
  'orange-noir',
  'neo-brutal-pop',
  'royal-amethyst',
  'minimal-light',
  'claymorph',
  'soft-bloom',
  'lavender-violet',
  'purple-peach',
  'mint-gray',
  'soft-pink-beige',
];

export const themes: Record<ThemeType, ThemeDefinition> = {
  'neon-lime': {
    id: 'neon-lime',
    label: 'neon lime',
    shortLabel: 'lime',
    description: 'black glass with acid lime highlights and a brutalist snap.',
    mode: 'dark',
    preview: ['#b9ff3f', '#7ef7ff', '#050505'],
    category: 'dark',
    colors: {
      background: '#050505',
      backgroundAlt: '#0c1110',
      surface: '#0f1110',
      surfaceSoft: '#151918',
      surfaceElevated: '#1b201e',
      surfaceHighlight: '#202624',
      primary: '#b9ff3f',
      primarySoft: '#e9ffc2',
      secondary: '#7ef7ff',
      accent: '#ff8a5b',
      text: '#f7ffe8',
      textMuted: '#a5af9d',
      textSubtle: '#73806d',
      textInverse: '#132100',
      success: '#79f59a',
      warning: '#ffcc69',
      error: '#ff7a68',
      border: 'rgba(185, 255, 63, 0.14)',
      borderStrong: 'rgba(185, 255, 63, 0.32)',
    },
    glow: {
      primary: '0 0 36px rgba(185, 255, 63, 0.24)',
      secondary: '0 0 34px rgba(126, 247, 255, 0.22)',
      accent: '0 0 28px rgba(255, 138, 91, 0.18)',
      focus: '0 0 0 1px rgba(185, 255, 63, 0.34), 0 0 0 6px rgba(185, 255, 63, 0.12)',
    },
    radius: {
      sm: '18px',
      md: '24px',
      lg: '30px',
      xl: '38px',
      pill: '999px',
    },
    elevation: {
      soft: '0 16px 36px rgba(0, 0, 0, 0.34)',
      card: '0 18px 44px rgba(0, 0, 0, 0.42)',
      strong: '0 24px 60px rgba(0, 0, 0, 0.52)',
      floating: '0 24px 60px rgba(0, 0, 0, 0.48), 0 0 42px rgba(185, 255, 63, 0.12)',
      nav: '0 24px 60px rgba(0, 0, 0, 0.48), 0 0 36px rgba(185, 255, 63, 0.16)',
    },
    effects: {
      pageGradient: 'radial-gradient(circle at 15% 12%, rgba(185, 255, 63, 0.12), transparent 30%), radial-gradient(circle at 82% 8%, rgba(126, 247, 255, 0.08), transparent 28%), linear-gradient(180deg, #050505 0%, #090b09 58%, #0c1110 100%)',
      surfaceGradient: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 34%, rgba(255,255,255,0) 100%)',
      heroGradient: 'linear-gradient(135deg, rgba(185, 255, 63, 0.2), rgba(126, 247, 255, 0.08) 52%, rgba(255, 138, 91, 0.05) 100%)',
    },
    motion: motionPresets.neonBrutalist,
  },
  'cyan-navy': {
    id: 'cyan-navy',
    label: 'cyan navy',
    shortLabel: 'cyan',
    description: 'deep navy surfaces with a cooler, smoother neon shimmer.',
    mode: 'dark',
    preview: ['#63e8ff', '#1d2f54', '#7ba9ff'],
    category: 'dark',
    colors: {
      background: '#07111d',
      backgroundAlt: '#0b1a2b',
      surface: '#0e1d30',
      surfaceSoft: '#13253a',
      surfaceElevated: '#182d45',
      surfaceHighlight: '#1e3550',
      primary: '#63e8ff',
      primarySoft: '#d1f9ff',
      secondary: '#7ba9ff',
      accent: '#4df4be',
      text: '#eff7ff',
      textMuted: '#9cb2ca',
      textSubtle: '#70849c',
      textInverse: '#082130',
      success: '#50f3bc',
      warning: '#f5bd65',
      error: '#ff8679',
      border: 'rgba(99, 232, 255, 0.12)',
      borderStrong: 'rgba(123, 169, 255, 0.26)',
    },
    glow: {
      primary: '0 0 34px rgba(99, 232, 255, 0.22)',
      secondary: '0 0 32px rgba(123, 169, 255, 0.18)',
      accent: '0 0 26px rgba(77, 244, 190, 0.16)',
      focus: '0 0 0 1px rgba(99, 232, 255, 0.3), 0 0 0 6px rgba(99, 232, 255, 0.1)',
    },
    radius: {
      sm: '18px',
      md: '24px',
      lg: '30px',
      xl: '38px',
      pill: '999px',
    },
    elevation: {
      soft: '0 18px 42px rgba(3, 11, 22, 0.3)',
      card: '0 20px 48px rgba(2, 8, 18, 0.42)',
      strong: '0 28px 70px rgba(2, 8, 18, 0.52)',
      floating: '0 24px 56px rgba(2, 8, 18, 0.48), 0 0 28px rgba(99, 232, 255, 0.12)',
      nav: '0 24px 54px rgba(2, 8, 18, 0.52), 0 0 32px rgba(99, 232, 255, 0.12)',
    },
    effects: {
      pageGradient: 'radial-gradient(circle at 18% 12%, rgba(99, 232, 255, 0.14), transparent 28%), radial-gradient(circle at 85% 8%, rgba(123, 169, 255, 0.09), transparent 26%), linear-gradient(180deg, #07111d 0%, #091625 56%, #0b1a2b 100%)',
      surfaceGradient: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 36%, rgba(255,255,255,0) 100%)',
      heroGradient: 'linear-gradient(135deg, rgba(99, 232, 255, 0.18), rgba(123, 169, 255, 0.09) 58%, rgba(77, 244, 190, 0.05) 100%)',
    },
    motion: motionPresets.darkSmooth,
  },
  'electric-blue': {
    id: 'electric-blue',
    label: 'electric blue',
    shortLabel: 'volt',
    description: 'charcoal layers, electric blue glints, and quick modern motion.',
    mode: 'dark',
    preview: ['#4fa8ff', '#9e7bff', '#0a0d15'],
    category: 'dark',
    colors: {
      background: '#0a0d15',
      backgroundAlt: '#101726',
      surface: '#121a2b',
      surfaceSoft: '#182133',
      surfaceElevated: '#1d2740',
      surfaceHighlight: '#24304d',
      primary: '#4fa8ff',
      primarySoft: '#d6ebff',
      secondary: '#9e7bff',
      accent: '#53f5d3',
      text: '#f4f8ff',
      textMuted: '#a7b4cb',
      textSubtle: '#73809a',
      textInverse: '#081626',
      success: '#60e6bb',
      warning: '#ffce76',
      error: '#ff7b89',
      border: 'rgba(79, 168, 255, 0.12)',
      borderStrong: 'rgba(158, 123, 255, 0.26)',
    },
    glow: {
      primary: '0 0 36px rgba(79, 168, 255, 0.24)',
      secondary: '0 0 30px rgba(158, 123, 255, 0.18)',
      accent: '0 0 24px rgba(83, 245, 211, 0.15)',
      focus: '0 0 0 1px rgba(79, 168, 255, 0.3), 0 0 0 6px rgba(79, 168, 255, 0.12)',
    },
    radius: {
      sm: '18px',
      md: '24px',
      lg: '30px',
      xl: '38px',
      pill: '999px',
    },
    elevation: {
      soft: '0 18px 42px rgba(7, 10, 20, 0.34)',
      card: '0 22px 54px rgba(7, 10, 20, 0.44)',
      strong: '0 28px 72px rgba(7, 10, 20, 0.56)',
      floating: '0 26px 64px rgba(7, 10, 20, 0.5), 0 0 28px rgba(79, 168, 255, 0.12)',
      nav: '0 24px 60px rgba(7, 10, 20, 0.52), 0 0 34px rgba(79, 168, 255, 0.14)',
    },
    effects: {
      pageGradient: 'radial-gradient(circle at 18% 14%, rgba(79, 168, 255, 0.14), transparent 28%), radial-gradient(circle at 84% 10%, rgba(158, 123, 255, 0.1), transparent 24%), linear-gradient(180deg, #0a0d15 0%, #101726 58%, #121a2b 100%)',
      surfaceGradient: 'linear-gradient(180deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 36%, rgba(255,255,255,0) 100%)',
      heroGradient: 'linear-gradient(135deg, rgba(79, 168, 255, 0.18), rgba(158, 123, 255, 0.1) 56%, rgba(83, 245, 211, 0.06) 100%)',
    },
    motion: motionPresets.darkSmooth,
  },
  'amber-charcoal': {
    id: 'amber-charcoal',
    label: 'amber charcoal',
    shortLabel: 'amber',
    description: 'warm amber signals, charcoal depth, and calm premium movement.',
    mode: 'dark',
    preview: ['#ffbb45', '#ff9153', '#171311'],
    category: 'dark',
    colors: {
      background: '#140f0d',
      backgroundAlt: '#1a1412',
      surface: '#1c1714',
      surfaceSoft: '#241d19',
      surfaceElevated: '#2a221d',
      surfaceHighlight: '#312823',
      primary: '#ffbb45',
      primarySoft: '#ffefc0',
      secondary: '#ff9153',
      accent: '#ffd97d',
      text: '#fff7ef',
      textMuted: '#c6b0a0',
      textSubtle: '#9b8374',
      textInverse: '#332100',
      success: '#a1f1a3',
      warning: '#ffd178',
      error: '#ff8b77',
      border: 'rgba(255, 187, 69, 0.14)',
      borderStrong: 'rgba(255, 145, 83, 0.28)',
    },
    glow: {
      primary: '0 0 34px rgba(255, 187, 69, 0.22)',
      secondary: '0 0 26px rgba(255, 145, 83, 0.18)',
      accent: '0 0 20px rgba(255, 217, 125, 0.15)',
      focus: '0 0 0 1px rgba(255, 187, 69, 0.3), 0 0 0 6px rgba(255, 187, 69, 0.12)',
    },
    radius: {
      sm: '18px',
      md: '24px',
      lg: '30px',
      xl: '38px',
      pill: '999px',
    },
    elevation: {
      soft: '0 18px 38px rgba(12, 7, 5, 0.32)',
      card: '0 20px 50px rgba(12, 7, 5, 0.44)',
      strong: '0 28px 70px rgba(12, 7, 5, 0.54)',
      floating: '0 24px 60px rgba(12, 7, 5, 0.48), 0 0 26px rgba(255, 187, 69, 0.1)',
      nav: '0 22px 54px rgba(12, 7, 5, 0.52), 0 0 30px rgba(255, 187, 69, 0.12)',
    },
    effects: {
      pageGradient: 'radial-gradient(circle at 16% 13%, rgba(255, 187, 69, 0.14), transparent 28%), radial-gradient(circle at 82% 10%, rgba(255, 145, 83, 0.08), transparent 24%), linear-gradient(180deg, #140f0d 0%, #1a1412 56%, #1f1815 100%)',
      surfaceGradient: 'linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.012) 36%, rgba(255,255,255,0) 100%)',
      heroGradient: 'linear-gradient(135deg, rgba(255, 187, 69, 0.18), rgba(255, 145, 83, 0.1) 52%, rgba(255, 217, 125, 0.06) 100%)',
    },
    motion: motionPresets.darkSmooth,
  },
  'graphite-green': {
    id: 'graphite-green',
    label: 'graphite green',
    shortLabel: 'graphite',
    description: 'graphite panels with restrained green accents and soft focus reveals.',
    mode: 'dark',
    preview: ['#78f0a0', '#90ff5e', '#101313'],
    category: 'dark',
    colors: {
      background: '#0d1111',
      backgroundAlt: '#111717',
      surface: '#151c1b',
      surfaceSoft: '#1a2321',
      surfaceElevated: '#212d2a',
      surfaceHighlight: '#293734',
      primary: '#78f0a0',
      primarySoft: '#d7ffe2',
      secondary: '#90ff5e',
      accent: '#60d0ff',
      text: '#f2fbf7',
      textMuted: '#a7bbb2',
      textSubtle: '#74877f',
      textInverse: '#0d2417',
      success: '#78f0a0',
      warning: '#f3ca73',
      error: '#ff8280',
      border: 'rgba(120, 240, 160, 0.12)',
      borderStrong: 'rgba(144, 255, 94, 0.26)',
    },
    glow: {
      primary: '0 0 32px rgba(120, 240, 160, 0.2)',
      secondary: '0 0 28px rgba(144, 255, 94, 0.18)',
      accent: '0 0 22px rgba(96, 208, 255, 0.16)',
      focus: '0 0 0 1px rgba(120, 240, 160, 0.28), 0 0 0 6px rgba(120, 240, 160, 0.1)',
    },
    radius: {
      sm: '18px',
      md: '24px',
      lg: '30px',
      xl: '38px',
      pill: '999px',
    },
    elevation: {
      soft: '0 18px 38px rgba(5, 10, 10, 0.3)',
      card: '0 20px 48px rgba(5, 10, 10, 0.42)',
      strong: '0 28px 68px rgba(5, 10, 10, 0.5)',
      floating: '0 24px 58px rgba(5, 10, 10, 0.46), 0 0 24px rgba(120, 240, 160, 0.1)',
      nav: '0 22px 52px rgba(5, 10, 10, 0.52), 0 0 28px rgba(120, 240, 160, 0.12)',
    },
    effects: {
      pageGradient: 'radial-gradient(circle at 16% 12%, rgba(120, 240, 160, 0.14), transparent 28%), radial-gradient(circle at 82% 9%, rgba(96, 208, 255, 0.08), transparent 24%), linear-gradient(180deg, #0d1111 0%, #111717 56%, #131b1a 100%)',
      surfaceGradient: 'linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.014) 36%, rgba(255,255,255,0) 100%)',
      heroGradient: 'linear-gradient(135deg, rgba(120, 240, 160, 0.18), rgba(144, 255, 94, 0.08) 52%, rgba(96, 208, 255, 0.06) 100%)',
    },
    motion: motionPresets.darkSmooth,
  },
  'minimal-light': {
    id: 'minimal-light',
    label: 'minimal light',
    shortLabel: 'minimal',
    description: 'quiet white surfaces, graphite typography, and restrained motion.',
    mode: 'light',
    preview: ['#ffffff', '#dbe2ea', '#2a3441'],
    category: 'soft',
    colors: {
      background: '#f4f7fb',
      backgroundAlt: '#edf2f7',
      surface: '#ffffff',
      surfaceSoft: '#f8fbff',
      surfaceElevated: '#eef3f8',
      surfaceHighlight: '#e2e9f0',
      primary: '#1f3f66',
      primarySoft: '#dce9f7',
      secondary: '#4b7bb8',
      accent: '#73b7ff',
      text: '#162230',
      textMuted: '#3d4f63',
      textSubtle: '#596d80',
      textInverse: '#f8fbff',
      success: '#2d9f67',
      warning: '#d18b34',
      error: '#d55c57',
      border: 'rgba(31, 63, 102, 0.1)',
      borderStrong: 'rgba(31, 63, 102, 0.18)',
    },
    glow: {
      primary: '0 12px 28px rgba(31, 63, 102, 0.14)',
      secondary: '0 10px 22px rgba(75, 123, 184, 0.12)',
      accent: '0 10px 20px rgba(115, 183, 255, 0.1)',
      focus: '0 0 0 1px rgba(75, 123, 184, 0.18), 0 0 0 6px rgba(75, 123, 184, 0.08)',
    },
    radius: {
      sm: '18px',
      md: '24px',
      lg: '30px',
      xl: '36px',
      pill: '999px',
    },
    elevation: {
      soft: '0 14px 28px rgba(20, 40, 62, 0.08)',
      card: '0 18px 38px rgba(20, 40, 62, 0.1)',
      strong: '0 22px 48px rgba(20, 40, 62, 0.14)',
      floating: '0 20px 44px rgba(20, 40, 62, 0.14)',
      nav: '0 18px 40px rgba(20, 40, 62, 0.12)',
    },
    effects: {
      pageGradient: 'radial-gradient(circle at 12% 10%, rgba(115, 183, 255, 0.14), transparent 26%), radial-gradient(circle at 88% 10%, rgba(220, 233, 247, 0.7), transparent 22%), linear-gradient(180deg, #f7f9fc 0%, #f1f5fa 52%, #edf2f7 100%)',
      surfaceGradient: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.12) 100%)',
      heroGradient: 'linear-gradient(135deg, rgba(31, 63, 102, 0.08), rgba(115, 183, 255, 0.12) 62%, rgba(255, 255, 255, 0.72) 100%)',
    },
    motion: motionPresets.lightMinimal,
  },
  claymorph: {
    id: 'claymorph',
    label: 'claymorph',
    shortLabel: 'clay',
    description: 'soft clay surfaces, pastel accents, and depth-led motion.',
    mode: 'light',
    preview: ['#f2c8bc', '#d6cff8', '#fff6ee'],
    category: 'soft',
    isFemaleFocused: true,
    colors: {
      background: '#f8efe9',
      backgroundAlt: '#f4e7df',
      surface: '#fff7f0',
      surfaceSoft: '#fffaf5',
      surfaceElevated: '#f3e6dc',
      surfaceHighlight: '#ead9ce',
      primary: '#b47262',
      primarySoft: '#f6ddd4',
      secondary: '#a495dc',
      accent: '#f1abbb',
      text: '#46312b',
      textMuted: '#6b5249',
      textSubtle: '#8a7069',
      textInverse: '#fff8f3',
      success: '#76b88f',
      warning: '#d7a65f',
      error: '#cf7263',
      border: 'rgba(180, 114, 98, 0.12)',
      borderStrong: 'rgba(164, 149, 220, 0.2)',
    },
    glow: {
      primary: '8px 8px 18px rgba(190, 159, 148, 0.2), -8px -8px 18px rgba(255, 255, 255, 0.65)',
      secondary: '0 12px 24px rgba(164, 149, 220, 0.16)',
      accent: '0 12px 24px rgba(241, 171, 187, 0.16)',
      focus: '0 0 0 1px rgba(164, 149, 220, 0.14), 0 0 0 6px rgba(164, 149, 220, 0.08)',
    },
    radius: {
      sm: '20px',
      md: '26px',
      lg: '32px',
      xl: '40px',
      pill: '999px',
    },
    elevation: {
      soft: '10px 10px 24px rgba(198, 177, 166, 0.22), -10px -10px 24px rgba(255, 255, 255, 0.82)',
      card: '14px 14px 28px rgba(198, 177, 166, 0.24), -14px -14px 28px rgba(255, 255, 255, 0.9)',
      strong: '18px 18px 36px rgba(198, 177, 166, 0.26), -18px -18px 36px rgba(255, 255, 255, 0.95)',
      floating: '14px 14px 30px rgba(198, 177, 166, 0.24), -10px -10px 24px rgba(255, 255, 255, 0.9)',
      nav: '12px 12px 28px rgba(198, 177, 166, 0.24), -10px -10px 20px rgba(255, 255, 255, 0.82)',
    },
    effects: {
      pageGradient: 'radial-gradient(circle at 14% 10%, rgba(241, 171, 187, 0.24), transparent 24%), radial-gradient(circle at 86% 10%, rgba(164, 149, 220, 0.18), transparent 24%), linear-gradient(180deg, #fbf3ee 0%, #f8eee6 52%, #f4e7df 100%)',
      surfaceGradient: 'linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.12) 100%)',
      heroGradient: 'linear-gradient(135deg, rgba(241, 171, 187, 0.18), rgba(164, 149, 220, 0.16) 58%, rgba(255, 255, 255, 0.68) 100%)',
    },
    motion: motionPresets.claySoft,
  },
  'soft-bloom': {
    id: 'soft-bloom',
    label: 'soft bloom',
    shortLabel: 'bloom',
    description: 'lavender, pink, and peach gradients with elegant float-like motion.',
    mode: 'light',
    preview: ['#f8b5cb', '#cdb8ff', '#ffd8c6'],
    category: 'light',
    isFemaleFocused: true,
    colors: {
      background: '#fff3f6',
      backgroundAlt: '#ffedf2',
      surface: '#fffafe',
      surfaceSoft: '#fff8fb',
      surfaceElevated: '#fbe8ef',
      surfaceHighlight: '#f6dbe6',
      primary: '#a16cf5',
      primarySoft: '#efe2ff',
      secondary: '#f49db7',
      accent: '#ffc0a8',
      text: '#442842',
      textMuted: '#674f64',
      textSubtle: '#876e84',
      textInverse: '#fff8fe',
      success: '#7dbd99',
      warning: '#d89967',
      error: '#de6b87',
      border: 'rgba(161, 108, 245, 0.12)',
      borderStrong: 'rgba(244, 157, 183, 0.22)',
    },
    glow: {
      primary: '0 18px 40px rgba(161, 108, 245, 0.16)',
      secondary: '0 14px 32px rgba(244, 157, 183, 0.18)',
      accent: '0 14px 30px rgba(255, 192, 168, 0.18)',
      focus: '0 0 0 1px rgba(161, 108, 245, 0.18), 0 0 0 6px rgba(161, 108, 245, 0.08)',
    },
    radius: {
      sm: '20px',
      md: '26px',
      lg: '32px',
      xl: '40px',
      pill: '999px',
    },
    elevation: {
      soft: '0 16px 30px rgba(209, 164, 198, 0.16)',
      card: '0 20px 42px rgba(209, 164, 198, 0.18)',
      strong: '0 24px 52px rgba(209, 164, 198, 0.22)',
      floating: '0 22px 46px rgba(209, 164, 198, 0.2)',
      nav: '0 20px 44px rgba(209, 164, 198, 0.18)',
    },
    effects: {
      pageGradient: 'radial-gradient(circle at 16% 10%, rgba(244, 157, 183, 0.24), transparent 24%), radial-gradient(circle at 84% 10%, rgba(161, 108, 245, 0.18), transparent 22%), linear-gradient(180deg, #fff7fb 0%, #fff1f5 54%, #ffedf2 100%)',
      surfaceGradient: 'linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.12) 100%)',
      heroGradient: 'linear-gradient(135deg, rgba(161, 108, 245, 0.16), rgba(244, 157, 183, 0.18) 52%, rgba(255, 192, 168, 0.14) 100%)',
    },
    motion: motionPresets.elegantFloat,
  },
  'orange-noir': {
    id: 'orange-noir',
    label: 'orange noir',
    shortLabel: 'ember',
    description: 'orange glow on black glass with a premium fintech pulse.',
    mode: 'dark',
    preview: ['#ff9e44', '#ff6b2c', '#060606'],
    category: 'dark',
    colors: {
      background: '#060606',
      backgroundAlt: '#0f0a08',
      surface: '#16100d',
      surfaceSoft: '#1d1612',
      surfaceElevated: '#261c17',
      surfaceHighlight: '#322520',
      primary: '#ff9e44',
      primarySoft: '#ffe2bf',
      secondary: '#ff6b2c',
      accent: '#ffd166',
      text: '#fff7f1',
      textMuted: '#cab4a1',
      textSubtle: '#967b68',
      textInverse: '#2b1400',
      success: '#8ee1a1',
      warning: '#ffd166',
      error: '#ff8869',
      border: 'rgba(255, 158, 68, 0.14)',
      borderStrong: 'rgba(255, 107, 44, 0.3)',
    },
    glow: {
      primary: '0 0 36px rgba(255, 158, 68, 0.24)',
      secondary: '0 0 30px rgba(255, 107, 44, 0.18)',
      accent: '0 0 22px rgba(255, 209, 102, 0.16)',
      focus: '0 0 0 1px rgba(255, 158, 68, 0.32), 0 0 0 6px rgba(255, 158, 68, 0.12)',
    },
    radius: {
      sm: '18px',
      md: '24px',
      lg: '30px',
      xl: '38px',
      pill: '999px',
    },
    elevation: {
      soft: '0 18px 38px rgba(7, 5, 4, 0.36)',
      card: '0 22px 54px rgba(7, 5, 4, 0.48)',
      strong: '0 28px 70px rgba(7, 5, 4, 0.56)',
      floating: '0 24px 60px rgba(7, 5, 4, 0.52), 0 0 30px rgba(255, 158, 68, 0.12)',
      nav: '0 24px 58px rgba(7, 5, 4, 0.54), 0 0 34px rgba(255, 107, 44, 0.14)',
    },
    effects: {
      pageGradient: 'radial-gradient(circle at 14% 10%, rgba(255, 158, 68, 0.16), transparent 28%), radial-gradient(circle at 84% 6%, rgba(255, 107, 44, 0.1), transparent 24%), linear-gradient(180deg, #060606 0%, #0c0907 56%, #120d0b 100%)',
      surfaceGradient: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.018) 34%, rgba(255,255,255,0) 100%)',
      heroGradient: 'linear-gradient(135deg, rgba(255, 158, 68, 0.22), rgba(255, 107, 44, 0.12) 52%, rgba(255, 209, 102, 0.08) 100%)',
    },
    motion: motionPresets.darkSmooth,
  },
  'neo-brutal-pop': {
    id: 'neo-brutal-pop',
    label: 'neo brutal pop',
    shortLabel: 'pop',
    description: 'cyan, red, and yellow accents with playful hard contrast.',
    mode: 'dark',
    preview: ['#37f6ff', '#ff4865', '#ffe55c'],
    category: 'dark',
    colors: {
      background: '#080808',
      backgroundAlt: '#111111',
      surface: '#171717',
      surfaceSoft: '#1e1e1e',
      surfaceElevated: '#262626',
      surfaceHighlight: '#313131',
      primary: '#37f6ff',
      primarySoft: '#d7fcff',
      secondary: '#ff4865',
      accent: '#ffe55c',
      text: '#fffbea',
      textMuted: '#d2d2c4',
      textSubtle: '#9f9f92',
      textInverse: '#06181a',
      success: '#78f29b',
      warning: '#ffe55c',
      error: '#ff4865',
      border: 'rgba(55, 246, 255, 0.16)',
      borderStrong: 'rgba(255, 72, 101, 0.34)',
    },
    glow: {
      primary: '0 0 30px rgba(55, 246, 255, 0.22)',
      secondary: '0 0 22px rgba(255, 72, 101, 0.24)',
      accent: '0 0 18px rgba(255, 229, 92, 0.18)',
      focus: '0 0 0 1px rgba(55, 246, 255, 0.32), 0 0 0 6px rgba(55, 246, 255, 0.12)',
    },
    radius: {
      sm: '16px',
      md: '22px',
      lg: '28px',
      xl: '34px',
      pill: '999px',
    },
    elevation: {
      soft: '0 12px 24px rgba(0, 0, 0, 0.32)',
      card: '8px 8px 0 rgba(55, 246, 255, 0.22), 0 18px 42px rgba(0, 0, 0, 0.42)',
      strong: '12px 12px 0 rgba(255, 72, 101, 0.18), 0 24px 60px rgba(0, 0, 0, 0.5)',
      floating: '10px 10px 0 rgba(255, 229, 92, 0.16), 0 24px 56px rgba(0, 0, 0, 0.48)',
      nav: '0 20px 44px rgba(0, 0, 0, 0.52), 6px 6px 0 rgba(55, 246, 255, 0.18)',
    },
    effects: {
      pageGradient: 'radial-gradient(circle at 16% 14%, rgba(55, 246, 255, 0.14), transparent 28%), radial-gradient(circle at 84% 10%, rgba(255, 72, 101, 0.12), transparent 22%), linear-gradient(180deg, #080808 0%, #101010 58%, #141414 100%)',
      surfaceGradient: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 36%, rgba(255,255,255,0) 100%)',
      heroGradient: 'linear-gradient(135deg, rgba(55, 246, 255, 0.18), rgba(255, 72, 101, 0.16) 58%, rgba(255, 229, 92, 0.16) 100%)',
    },
    motion: motionPresets.playfulPop,
  },
  'royal-amethyst': {
    id: 'royal-amethyst',
    label: 'royal amethyst',
    shortLabel: 'royal',
    description: 'deep purple and black with velvet highlights and composed motion.',
    mode: 'dark',
    preview: ['#8f6dff', '#d46fff', '#08060e'],
    category: 'dark',
    colors: {
      background: '#08060e',
      backgroundAlt: '#100b18',
      surface: '#151022',
      surfaceSoft: '#1b152b',
      surfaceElevated: '#241c38',
      surfaceHighlight: '#2e2447',
      primary: '#8f6dff',
      primarySoft: '#e1d6ff',
      secondary: '#d46fff',
      accent: '#6ef0ff',
      text: '#f8f3ff',
      textMuted: '#b9a9d0',
      textSubtle: '#87789f',
      textInverse: '#170f2a',
      success: '#8af0b2',
      warning: '#ffcf7c',
      error: '#ff7fa7',
      border: 'rgba(143, 109, 255, 0.14)',
      borderStrong: 'rgba(212, 111, 255, 0.28)',
    },
    glow: {
      primary: '0 0 34px rgba(143, 109, 255, 0.24)',
      secondary: '0 0 30px rgba(212, 111, 255, 0.18)',
      accent: '0 0 24px rgba(110, 240, 255, 0.14)',
      focus: '0 0 0 1px rgba(143, 109, 255, 0.32), 0 0 0 6px rgba(143, 109, 255, 0.12)',
    },
    radius: {
      sm: '18px',
      md: '24px',
      lg: '30px',
      xl: '38px',
      pill: '999px',
    },
    elevation: {
      soft: '0 18px 40px rgba(5, 3, 11, 0.34)',
      card: '0 22px 54px rgba(5, 3, 11, 0.46)',
      strong: '0 28px 72px rgba(5, 3, 11, 0.56)',
      floating: '0 24px 60px rgba(5, 3, 11, 0.5), 0 0 30px rgba(143, 109, 255, 0.12)',
      nav: '0 22px 56px rgba(5, 3, 11, 0.54), 0 0 32px rgba(212, 111, 255, 0.12)',
    },
    effects: {
      pageGradient: 'radial-gradient(circle at 18% 14%, rgba(143, 109, 255, 0.16), transparent 28%), radial-gradient(circle at 86% 8%, rgba(212, 111, 255, 0.1), transparent 22%), linear-gradient(180deg, #08060e 0%, #0d0915 56%, #140f20 100%)',
      surfaceGradient: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.018) 36%, rgba(255,255,255,0) 100%)',
      heroGradient: 'linear-gradient(135deg, rgba(143, 109, 255, 0.2), rgba(212, 111, 255, 0.12) 52%, rgba(110, 240, 255, 0.06) 100%)',
    },
    motion: motionPresets.royalVelvet,
  },
  'lavender-violet': {
    id: 'lavender-violet',
    label: 'lavender violet',
    shortLabel: 'lavender',
    description: 'soft lavender gradients with elegant violet contrast.',
    mode: 'light',
    preview: ['#d9ccff', '#9c7cff', '#fff8ff'],
    category: 'soft',
    isFemaleFocused: true,
    colors: {
      background: '#faf7ff',
      backgroundAlt: '#f3eeff',
      surface: '#ffffff',
      surfaceSoft: '#fbf7ff',
      surfaceElevated: '#eee6ff',
      surfaceHighlight: '#e2d5ff',
      primary: '#7852d8',
      primarySoft: '#ede5ff',
      secondary: '#9c7cff',
      accent: '#c5b0ff',
      text: '#33264d',
      textMuted: '#4a3e60',
      textSubtle: '#655882',
      textInverse: '#faf7ff',
      success: '#6db991',
      warning: '#daaa66',
      error: '#d56d92',
      border: 'rgba(120, 82, 216, 0.12)',
      borderStrong: 'rgba(156, 124, 255, 0.22)',
    },
    glow: {
      primary: '0 16px 36px rgba(120, 82, 216, 0.14)',
      secondary: '0 12px 28px rgba(156, 124, 255, 0.16)',
      accent: '0 10px 22px rgba(197, 176, 255, 0.16)',
      focus: '0 0 0 1px rgba(120, 82, 216, 0.18), 0 0 0 6px rgba(120, 82, 216, 0.08)',
    },
    radius: {
      sm: '20px',
      md: '26px',
      lg: '32px',
      xl: '40px',
      pill: '999px',
    },
    elevation: {
      soft: '0 14px 28px rgba(126, 108, 181, 0.12)',
      card: '0 18px 38px rgba(126, 108, 181, 0.15)',
      strong: '0 22px 48px rgba(126, 108, 181, 0.2)',
      floating: '0 20px 42px rgba(126, 108, 181, 0.18)',
      nav: '0 18px 40px rgba(126, 108, 181, 0.16)',
    },
    effects: {
      pageGradient: 'radial-gradient(circle at 14% 8%, rgba(156, 124, 255, 0.18), transparent 24%), radial-gradient(circle at 86% 10%, rgba(213, 109, 146, 0.12), transparent 20%), linear-gradient(180deg, #fdfbff 0%, #f7f3ff 52%, #f2edff 100%)',
      surfaceGradient: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.14) 100%)',
      heroGradient: 'linear-gradient(135deg, rgba(156, 124, 255, 0.18), rgba(120, 82, 216, 0.14) 52%, rgba(197, 176, 255, 0.12) 100%)',
    },
    motion: motionPresets.elegantFloat,
  },
  'purple-peach': {
    id: 'purple-peach',
    label: 'purple peach',
    shortLabel: 'peach',
    description: 'balanced purple depth with peach warmth and clean contrast.',
    mode: 'light',
    preview: ['#8d6af2', '#ffb9a0', '#fff8f4'],
    category: 'soft',
    colors: {
      background: '#fff7f4',
      backgroundAlt: '#fff0eb',
      surface: '#fffdfb',
      surfaceSoft: '#fff9f6',
      surfaceElevated: '#f7e8e3',
      surfaceHighlight: '#efd8d0',
      primary: '#7a56df',
      primarySoft: '#eee7ff',
      secondary: '#f6a88e',
      accent: '#ffcfbf',
      text: '#34263b',
      textMuted: '#524158',
      textSubtle: '#6d5e75',
      textInverse: '#fff9f7',
      success: '#6fb489',
      warning: '#d79558',
      error: '#d86a73',
      border: 'rgba(122, 86, 223, 0.12)',
      borderStrong: 'rgba(246, 168, 142, 0.24)',
    },
    glow: {
      primary: '0 16px 34px rgba(122, 86, 223, 0.14)',
      secondary: '0 12px 28px rgba(246, 168, 142, 0.16)',
      accent: '0 10px 20px rgba(255, 207, 191, 0.16)',
      focus: '0 0 0 1px rgba(122, 86, 223, 0.18), 0 0 0 6px rgba(122, 86, 223, 0.08)',
    },
    radius: {
      sm: '20px',
      md: '26px',
      lg: '32px',
      xl: '40px',
      pill: '999px',
    },
    elevation: {
      soft: '0 14px 28px rgba(137, 106, 128, 0.12)',
      card: '0 18px 38px rgba(137, 106, 128, 0.15)',
      strong: '0 22px 48px rgba(137, 106, 128, 0.18)',
      floating: '0 20px 42px rgba(137, 106, 128, 0.16)',
      nav: '0 18px 40px rgba(137, 106, 128, 0.14)',
    },
    effects: {
      pageGradient: 'radial-gradient(circle at 12% 10%, rgba(246, 168, 142, 0.2), transparent 24%), radial-gradient(circle at 84% 8%, rgba(122, 86, 223, 0.16), transparent 22%), linear-gradient(180deg, #fffaf8 0%, #fff3ef 52%, #ffede8 100%)',
      surfaceGradient: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.14) 100%)',
      heroGradient: 'linear-gradient(135deg, rgba(122, 86, 223, 0.16), rgba(246, 168, 142, 0.18) 52%, rgba(255, 207, 191, 0.14) 100%)',
    },
    motion: motionPresets.elegantFloat,
  },
  'mint-gray': {
    id: 'mint-gray',
    label: 'mint gray',
    shortLabel: 'mint',
    description: 'fresh mint accents over light gray for a crisp minimal feel.',
    mode: 'light',
    preview: ['#7fd6bf', '#cfd7d8', '#f6fbfb'],
    category: 'light',
    colors: {
      background: '#f4faf9',
      backgroundAlt: '#edf4f3',
      surface: '#ffffff',
      surfaceSoft: '#f7fbfb',
      surfaceElevated: '#e7efee',
      surfaceHighlight: '#dce5e4',
      primary: '#2c7567',
      primarySoft: '#d8f2eb',
      secondary: '#7fd6bf',
      accent: '#9fe7d4',
      text: '#19312d',
      textMuted: '#37514c',
      textSubtle: '#566f6a',
      textInverse: '#f7fffd',
      success: '#3ca874',
      warning: '#c79242',
      error: '#cf6e63',
      border: 'rgba(44, 117, 103, 0.12)',
      borderStrong: 'rgba(127, 214, 191, 0.24)',
    },
    glow: {
      primary: '0 14px 30px rgba(44, 117, 103, 0.12)',
      secondary: '0 10px 24px rgba(127, 214, 191, 0.16)',
      accent: '0 10px 20px rgba(159, 231, 212, 0.14)',
      focus: '0 0 0 1px rgba(44, 117, 103, 0.16), 0 0 0 6px rgba(44, 117, 103, 0.08)',
    },
    radius: {
      sm: '18px',
      md: '24px',
      lg: '30px',
      xl: '36px',
      pill: '999px',
    },
    elevation: {
      soft: '0 14px 28px rgba(78, 117, 109, 0.1)',
      card: '0 18px 38px rgba(78, 117, 109, 0.12)',
      strong: '0 22px 48px rgba(78, 117, 109, 0.16)',
      floating: '0 20px 42px rgba(78, 117, 109, 0.14)',
      nav: '0 18px 40px rgba(78, 117, 109, 0.12)',
    },
    effects: {
      pageGradient: 'radial-gradient(circle at 14% 10%, rgba(127, 214, 191, 0.18), transparent 24%), radial-gradient(circle at 86% 10%, rgba(211, 223, 224, 0.5), transparent 24%), linear-gradient(180deg, #f8fcfc 0%, #f1f8f7 52%, #edf4f3 100%)',
      surfaceGradient: 'linear-gradient(180deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.16) 100%)',
      heroGradient: 'linear-gradient(135deg, rgba(44, 117, 103, 0.08), rgba(127, 214, 191, 0.12) 58%, rgba(255, 255, 255, 0.74) 100%)',
    },
    motion: motionPresets.freshBreeze,
  },
  'soft-pink-beige': {
    id: 'soft-pink-beige',
    label: 'soft pink beige',
    shortLabel: 'blush',
    description: 'warm blush and beige layers with gentle, polished softness.',
    mode: 'light',
    preview: ['#f4b7c2', '#ead5c8', '#fff8f6'],
    category: 'soft',
    isFemaleFocused: true,
    colors: {
      background: '#fff7f5',
      backgroundAlt: '#f9efeb',
      surface: '#fffdfb',
      surfaceSoft: '#fff8f5',
      surfaceElevated: '#f5e7e1',
      surfaceHighlight: '#ecd7cf',
      primary: '#b76c82',
      primarySoft: '#fae4eb',
      secondary: '#dca28d',
      accent: '#f4b7c2',
      text: '#432c32',
      textMuted: '#5c4249',
      textSubtle: '#755c64',
      textInverse: '#fff8f9',
      success: '#78b38e',
      warning: '#d39b56',
      error: '#d76e79',
      border: 'rgba(183, 108, 130, 0.12)',
      borderStrong: 'rgba(220, 162, 141, 0.24)',
    },
    glow: {
      primary: '0 16px 34px rgba(183, 108, 130, 0.14)',
      secondary: '0 12px 26px rgba(220, 162, 141, 0.16)',
      accent: '0 10px 22px rgba(244, 183, 194, 0.16)',
      focus: '0 0 0 1px rgba(183, 108, 130, 0.18), 0 0 0 6px rgba(183, 108, 130, 0.08)',
    },
    radius: {
      sm: '20px',
      md: '26px',
      lg: '32px',
      xl: '40px',
      pill: '999px',
    },
    elevation: {
      soft: '0 14px 28px rgba(151, 116, 118, 0.12)',
      card: '0 18px 38px rgba(151, 116, 118, 0.14)',
      strong: '0 22px 48px rgba(151, 116, 118, 0.18)',
      floating: '0 20px 42px rgba(151, 116, 118, 0.16)',
      nav: '0 18px 40px rgba(151, 116, 118, 0.14)',
    },
    effects: {
      pageGradient: 'radial-gradient(circle at 14% 10%, rgba(244, 183, 194, 0.18), transparent 24%), radial-gradient(circle at 86% 10%, rgba(220, 162, 141, 0.14), transparent 22%), linear-gradient(180deg, #fffaf8 0%, #fff4f1 54%, #f9efeb 100%)',
      surfaceGradient: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.14) 100%)',
      heroGradient: 'linear-gradient(135deg, rgba(183, 108, 130, 0.12), rgba(244, 183, 194, 0.18) 52%, rgba(220, 162, 141, 0.16) 100%)',
    },
    motion: motionPresets.elegantFloat,
  },
};

type Rgb = { r: number; g: number; b: number };

function hexToRgb(value: string): Rgb | null {
  const normalized = value.trim();
  const hex = normalized.startsWith('#') ? normalized.slice(1) : normalized;

  if (![3, 6].includes(hex.length)) return null;

  const expanded = hex.length === 3
    ? hex.split('').map((part) => `${part}${part}`).join('')
    : hex;
  const parsed = Number.parseInt(expanded, 16);

  if (Number.isNaN(parsed)) return null;

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

function rgbToHex({ r, g, b }: Rgb) {
  return `#${[r, g, b]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0'))
    .join('')}`;
}

function mixHex(base: string, mixWith: string, weight: number) {
  const baseRgb = hexToRgb(base);
  const mixRgb = hexToRgb(mixWith);

  if (!baseRgb || !mixRgb) return base;

  return rgbToHex({
    r: baseRgb.r + (mixRgb.r - baseRgb.r) * weight,
    g: baseRgb.g + (mixRgb.g - baseRgb.g) * weight,
    b: baseRgb.b + (mixRgb.b - baseRgb.b) * weight,
  });
}

function getRelativeLuminance(color: string) {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  const channels = [rgb.r, rgb.g, rgb.b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
}

function getContrastRatio(foreground: string, background: string) {
  const lighter = Math.max(getRelativeLuminance(foreground), getRelativeLuminance(background));
  const darker = Math.min(getRelativeLuminance(foreground), getRelativeLuminance(background));

  return (lighter + 0.05) / (darker + 0.05);
}

function ensureContrast(
  foreground: string,
  background: string,
  minimumRatio: number,
  fallback: string,
) {
  return getContrastRatio(foreground, background) >= minimumRatio ? foreground : fallback;
}

function getAccessibleTokens(theme: ThemeDefinition) {
  const lightText = '#f8fbff';
  const darkText = '#18222f';
  const mutedLightText = '#d6deea';
  const mutedDarkText = '#3a4b5c';
  const subtleLightText = '#a6b5c7';
  const subtleDarkText = '#546476';

  const resolvedText = ensureContrast(
    theme.colors.text,
    theme.colors.background,
    theme.mode === 'light' ? 7 : 4.5,
    theme.mode === 'light' ? darkText : lightText,
  );

  const resolvedTextMuted = ensureContrast(
    theme.colors.textMuted,
    theme.colors.surface,
    4.5,
    theme.mode === 'light' ? mutedDarkText : mutedLightText,
  );

  const resolvedTextSubtle = ensureContrast(
    theme.colors.textSubtle,
    theme.colors.surface,
    3.2,
    theme.mode === 'light' ? subtleDarkText : subtleLightText,
  );

  return {
    text: resolvedText,
    textMuted: resolvedTextMuted,
    textSubtle: resolvedTextSubtle,
    surfaceCard: theme.mode === 'light'
      ? mixHex(theme.colors.surface, theme.colors.primarySoft, 0.08)
      : mixHex(theme.colors.surface, '#ffffff', 0.035),
    surfaceCardSoft: theme.mode === 'light'
      ? mixHex(theme.colors.surfaceSoft, '#ffffff', 0.16)
      : mixHex(theme.colors.surfaceSoft, '#ffffff', 0.045),
    surfaceCardElevated: theme.mode === 'light'
      ? mixHex(theme.colors.surfaceElevated, theme.colors.primarySoft, 0.1)
      : mixHex(theme.colors.surfaceElevated, '#ffffff', 0.06),
    overlayBackdrop: theme.mode === 'light' ? 'rgba(244, 247, 251, 0.72)' : 'rgba(5, 7, 11, 0.72)',
    overlayBlur: theme.mode === 'light' ? '14px' : '12px',
    navBackground: theme.mode === 'light'
      ? 'color-mix(in srgb, var(--surface-card) 88%, white)'
      : 'color-mix(in srgb, var(--surface-card) 80%, transparent)',
    pageTextShadow: theme.mode === 'dark' ? theme.glow.primary : 'none',
    cardBorder: theme.mode === 'light'
      ? 'color-mix(in srgb, var(--border-strong) 64%, white 36%)'
      : 'var(--border)',
  };
}

export const themeOptions = themeOrder.map((themeId) => themes[themeId]);

export function isValidTheme(theme: string | null | undefined): theme is ThemeType {
  if (!theme) return false;
  return Object.hasOwn(themes, theme);
}

export function isDarkTheme(theme: ThemeType) {
  return themes[theme].mode === 'dark';
}

export function getThemeCssVariables(theme: ThemeDefinition) {
  const accessible = getAccessibleTokens(theme);

  return {
    background: theme.colors.background,
    'background-alt': theme.colors.backgroundAlt,
    surface: theme.colors.surface,
    'surface-soft': theme.colors.surfaceSoft,
    'surface-elevated': theme.colors.surfaceElevated,
    'surface-highlight': theme.colors.surfaceHighlight,
    'surface-low': theme.colors.surfaceSoft,
    'surface-high': theme.colors.surfaceElevated,
    'surface-highest': theme.colors.surfaceHighlight,
    'surface-card': accessible.surfaceCard,
    'surface-card-soft': accessible.surfaceCardSoft,
    'surface-card-elevated': accessible.surfaceCardElevated,
    primary: theme.colors.primary,
    'primary-soft': theme.colors.primarySoft,
    'primary-container': theme.colors.primarySoft,
    secondary: theme.colors.secondary,
    tertiary: theme.colors.accent,
    accent: theme.colors.accent,
    text: accessible.text,
    'text-muted': accessible.textMuted,
    'text-subtle': accessible.textSubtle,
    'text-inverse': theme.colors.textInverse,
    'on-primary': theme.colors.textInverse,
    'on-surface': accessible.text,
    'on-surface-variant': accessible.textMuted,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
    outline: theme.colors.border,
    border: theme.colors.border,
    'border-strong': theme.colors.borderStrong,
    'card-border': accessible.cardBorder,
    'glow-primary': theme.glow.primary,
    'glow-secondary': theme.glow.secondary,
    'glow-accent': theme.glow.accent,
    'glow-focus': theme.glow.focus,
    'radius-sm': theme.radius.sm,
    'radius-md': theme.radius.md,
    'radius-lg': theme.radius.lg,
    'radius-xl': theme.radius.xl,
    'radius-pill': theme.radius.pill,
    'elevation-soft': theme.elevation.soft,
    'elevation-card': theme.elevation.card,
    'elevation-strong': theme.elevation.strong,
    'elevation-floating': theme.elevation.floating,
    'elevation-nav': theme.elevation.nav,
    'page-gradient': theme.effects.pageGradient,
    'surface-gradient': theme.effects.surfaceGradient,
    'hero-gradient': theme.effects.heroGradient,
    'overlay-backdrop': accessible.overlayBackdrop,
    'overlay-blur': accessible.overlayBlur,
    'nav-background': accessible.navBackground,
    'page-text-shadow': accessible.pageTextShadow,
  };
}

const themeModeMap = Object.fromEntries(
  themeOptions.map((theme) => [theme.id, theme.mode]),
) as Record<ThemeType, ThemeDefinition['mode']>;

const themeCssVariableMap = Object.fromEntries(
  themeOptions.map((theme) => [theme.id, getThemeCssVariables(theme)]),
) as Record<ThemeType, ReturnType<typeof getThemeCssVariables>>;

export function getThemeBootstrapScript(initialTheme: ThemeType = defaultTheme) {
  return `
    (() => {
      try {
        const themes = ${JSON.stringify(themeCssVariableMap)};
        const modes = ${JSON.stringify(themeModeMap)};
        const storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
        const cookieKey = ${JSON.stringify(THEME_COOKIE_KEY)};
        const introKey = ${JSON.stringify(INTRO_STORAGE_KEY)};
        const fallbackTheme = ${JSON.stringify(initialTheme)};
        const root = document.documentElement;
        const domTheme = root.dataset.theme;
        const storedTheme = localStorage.getItem(storageKey);
        const theme = storedTheme && themes[storedTheme]
          ? storedTheme
          : domTheme && themes[domTheme]
            ? domTheme
            : fallbackTheme;
        const variables = themes[theme];

        Object.entries(variables).forEach(([key, value]) => {
          root.style.setProperty('--' + key, value);
        });

        root.dataset.theme = theme;
        root.dataset.themeMode = modes[theme] || 'dark';
        const introSeen = sessionStorage.getItem(introKey) === 'true';
        root.dataset.introSeen = introSeen ? 'true' : 'false';
        root.dataset.appVisible = introSeen ? 'true' : 'false';
        root.style.colorScheme = root.dataset.themeMode;
        root.classList.toggle('dark', root.dataset.themeMode === 'dark');
        localStorage.setItem(storageKey, theme);
        document.cookie = cookieKey + '=' + theme + '; path=/; max-age=31536000; SameSite=Lax';

        if (document.body) {
          document.body.dataset.theme = theme;
        } else {
          document.addEventListener('DOMContentLoaded', () => {
            document.body.dataset.theme = theme;
          }, { once: true });
        }
      } catch (error) {
        void error;
      }
    })();
  `;
}
