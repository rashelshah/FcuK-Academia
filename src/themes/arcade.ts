import { ThemeDefinition } from '@/lib/types';
import { motionPresets } from '@/lib/motion';

export const arcadeTheme: ThemeDefinition = {
  id: 'arcade',
  label: 'arcade royal',
  shortLabel: 'arcade',
  isNew: true,
  description: 'neon-lit arcade cabinet with glowing machines and retro pixel art.',
  fontFamily: '"Press Start 2P", "VT323", "Pixelify Sans", sans-serif',
  mode: 'dark',
  category: 'dark',
  preview: ['#00A8FF', '#FF2E43', '#0A0A0A'],
  colors: {
    background: '#0A0A0A',
    backgroundAlt: '#111111',
    surface: '#0A0A0A',
    surfaceSoft: '#1A1A1A',
    surfaceElevated: '#222222',
    surfaceHighlight: '#333333',
    primary: '#00A8FF',
    primarySoft: '#4DD0FF',
    secondary: '#FF2E43',
    accent: '#FFD600',
    text: '#F5F5F5',
    textMuted: '#AAAAAA',
    textSubtle: '#666666',
    textInverse: '#0A0A0A',
    success: '#00E676',
    warning: '#FFD600',
    error: '#FF2E43',
    border: '#333333',
    borderStrong: '#555555',
  },
  glow: {
    primary: '0 0 0 2px #00A8FF',
    secondary: '0 0 0 2px #FF2E43',
    accent: '0 0 0 2px #FFD600',
    focus: '0 0 0 4px #00A8FF, 0 0 0 6px #0A0A0A',
  },
  radius: {
    sm: '0px',
    md: '0px',
    lg: '0px',
    xl: '0px',
    pill: '0px',
  },
  elevation: {
    soft: '4px 4px 0px rgba(0, 0, 0, 1)',
    card: '6px 6px 0px rgba(0, 0, 0, 1)',
    strong: '8px 8px 0px rgba(0, 0, 0, 1)',
    floating: '12px 12px 0px rgba(0, 0, 0, 1)',
    nav: '0 -4px 0px rgba(0,0,0,1)',
  },
  effects: {
    pageGradient: 'none',
    surfaceGradient: 'none',
    heroGradient: 'none',
  },
  motion: motionPresets.playfulPop,
  dictionary: {
    dashboard: 'PLAYER HUB',
    attendance: 'ENERGY BAR',
    marks: 'HIGH SCORE',
    timetable: 'LEVEL SELECT',
    assignments: 'QUESTS',
    settings: 'OPTIONS',
    notifications: 'POWER-UPS',
    refresh: 'CONTINUE',
    login: 'PRESS START',
    sessionExpired: 'GAME OVER',
  },
  copy: {
    attendance: {
      safe: [
        "FULL POWER",
      ],
      warning: [
        "LOW ENERGY",
        "CRITICAL DAMAGE"
      ]
    },
    marks: {
      high: [
        "PLAYER ONE READY",
        "LEVEL CLEARED"
      ],
      low: [
        "WARNING: BOSS AHEAD",
      ]
    },
    holiday: [
      "SYSTEM MAINTENANCE",
      "OUT OF ORDER",
    ],
    session: {
      expired: "CONTINUE?",
      reconnect: "INSERT LOGIN TO RESUME SESSION"
    }
  }
};
