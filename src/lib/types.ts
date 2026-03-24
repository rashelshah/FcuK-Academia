export interface Subject {
  id: string;
  name: string;
  code: string;
  teacher: string;
  credits: number;
  attendance: {
    attended: number;
    total: number;
    percentage: number;
  };
  marks: {
    internal: number;
    totalInternal: number;
    exams: {
      exam: string;
      obtained: number | null;
      maxMark: number | null;
    }[];
    grade?: string;
  };
}

export interface TimetableEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  room: string;
}

export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  subjectId: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  studentId: string;
}

export type ThemeType =
  | 'neon-lime'
  | 'cyan-navy'
  | 'electric-blue'
  | 'amber-charcoal'
  | 'graphite-green'
  | 'orange-noir'
  | 'neo-brutal-pop'
  | 'royal-amethyst'
  | 'minimal-light'
  | 'claymorph'
  | 'soft-bloom'
  | 'lavender-violet'
  | 'purple-peach'
  | 'mint-gray'
  | 'soft-pink-beige';

export interface ThemeMotionPreset {
  id: string;
  page: {
    distance: number;
    scale: number;
    blur: number;
    fadeDuration: number;
    spring: {
      stiffness: number;
      damping: number;
      mass: number;
    };
  };
  swipe: {
    threshold: number;
    velocityThreshold: number;
    distance: number;
    scale: number;
    fadeDuration: number;
    spring: {
      stiffness: number;
      damping: number;
      mass: number;
    };
  };
  reveal: {
    y: number;
    blur: number;
    scale: number;
    stagger: number;
    delay: number;
    duration: number;
    ease: [number, number, number, number];
  };
  micro: {
    tapScale: number;
    hoverScale: number;
    hoverY: number;
    duration: number;
  };
  route: {
    panelTravel: number;
    panelScale: number;
    panelOpacity: number;
    duration: number;
    labelDuration: number;
  };
  intro: {
    logoScale: number;
    glowScale: number;
    duration: number;
    delay: number;
  };
}

export interface ThemeDefinition {
  id: ThemeType;
  label: string;
  shortLabel: string;
  description: string;
  mode: 'dark' | 'light';
  category: 'dark' | 'light' | 'soft';
  preview: string[];
  isFemaleFocused?: boolean;
  colors: {
    background: string;
    backgroundAlt: string;
    surface: string;
    surfaceSoft: string;
    surfaceElevated: string;
    surfaceHighlight: string;
    primary: string;
    primarySoft: string;
    secondary: string;
    accent: string;
    text: string;
    textMuted: string;
    textSubtle: string;
    textInverse: string;
    success: string;
    warning: string;
    error: string;
    border: string;
    borderStrong: string;
  };
  glow: {
    primary: string;
    secondary: string;
    accent: string;
    focus: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    pill: string;
  };
  elevation: {
    soft: string;
    card: string;
    strong: string;
    floating: string;
    nav: string;
  };
  effects: {
    pageGradient: string;
    surfaceGradient: string;
    heroGradient: string;
  };
  motion: ThemeMotionPreset;
}
