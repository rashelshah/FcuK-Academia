import { ThemeDefinition } from '@/lib/types';
import { motionPresets } from '@/lib/motion';

export const missionControlTheme: ThemeDefinition = {
  id: 'mission-control',
  label: 'mission control',
  shortLabel: 'mission',
  description: 'premium spacecraft telemetry with holographic control panels.',
  fontFamily: '"Space Grotesk", "Orbitron", "Inter", sans-serif',
  mode: 'dark',
  category: 'dark',
  preview: ['#00E5FF', '#8B5CF6', '#131C35'],
  colors: {
    background: '#050816',
    backgroundAlt: '#0B1020',
    surface: 'rgba(11, 16, 32, 0.45)', // frosted dark glass
    surfaceSoft: 'rgba(19, 28, 53, 0.55)',
    surfaceElevated: 'rgba(25, 36, 68, 0.65)',
    surfaceHighlight: 'rgba(35, 50, 90, 0.75)',
    primary: '#00E5FF',
    primarySoft: '#80F2FF',
    secondary: '#8B5CF6',
    accent: '#3CF2A4', // mint green used as success/accent
    text: '#FFFFFF',
    textMuted: '#94A3B8',
    textSubtle: '#64748B',
    textInverse: '#001A1E',
    success: '#3CF2A4',
    warning: '#FFB800',
    error: '#FF4D4D',
    border: 'rgba(0, 229, 255, 0.15)', // Thin holographic outlines
    borderStrong: 'rgba(0, 229, 255, 0.3)',
  },
  glow: {
    primary: '0 0 20px rgba(0, 229, 255, 0.25), inset 0 0 10px rgba(0, 229, 255, 0.1)', // inner glow
    secondary: '0 0 20px rgba(139, 92, 246, 0.25), inset 0 0 10px rgba(139, 92, 246, 0.1)',
    accent: '0 0 20px rgba(60, 242, 164, 0.25), inset 0 0 10px rgba(60, 242, 164, 0.1)',
    focus: '0 0 0 1px rgba(0, 229, 255, 0.4), 0 0 0 4px rgba(0, 229, 255, 0.15)',
  },
  radius: {
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    pill: '9999px',
  },
  elevation: {
    soft: '0 8px 32px rgba(0, 0, 0, 0.4)',
    card: '0 12px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
    strong: '0 24px 64px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
    floating: '0 32px 80px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 229, 255, 0.15)',
    nav: '0 24px 64px rgba(0, 0, 0, 0.7), 0 0 24px rgba(0, 229, 255, 0.1)',
  },
  effects: {
    pageGradient: 'linear-gradient(180deg, #050816 0%, #0B1020 50%, #131C35 100%)',
    surfaceGradient: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
    heroGradient: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
  },
  motion: motionPresets.darkSmooth,
  dictionary: {
    attendance: 'Oxygen Level',
    marks: 'Mission Score',
    timetable: 'Flight Plan',
    assignments: 'Mission Tasks',
    settings: 'Spacecraft Systems',
    notifications: 'Incoming Transmission',
    refresh: 'Recalibrate',
    login: 'Reconnect to Mission',
    sessionExpired: 'Connection to Command Center Lost',
  },
  copy: {
    attendance: {
      safe: [
        "Life Support Stable.",
        "Oxygen reserves nominal.",
        "Life support running at optimal capacity."
      ],
      warning: [
        "Oxygen Reserves Critical.",
        "Life support failure imminent.",
        "Warning: Immediate recalibration required."
      ]
    },
    marks: {
      high: [
        "Mission success probability: Excellent.",
        "Trajectory is perfectly aligned.",
        "Primary objectives met with distinction."
      ],
      low: [
        "Trajectory deviation detected.",
        "Mission parameters falling below acceptable limits.",
        "Alert: Recalibrate mission objectives."
      ]
    },
    holiday: [
      "Expedition paused. Crew on recovery leave.",
      "Ship in orbit mode. All non-essential systems offline.",
      "Awaiting orders. Enjoy the stasis period."
    ],
    session: {
      expired: "Connection to Command Center Lost",
      reconnect: "Reconnect to Mission"
    }
  }
};
