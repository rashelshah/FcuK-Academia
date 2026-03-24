import { ThemeType } from './types';

export interface ThemeColors {
  background: string;
  surface: string;
  'surface-low': string;
  'surface-high': string;
  'surface-highest': string;
  primary: string;
  'primary-container': string;
  'on-primary': string;
  secondary: string;
  tertiary: string;
  error: string;
  outline: string;
  'on-surface': string;
  'on-surface-variant': string;
}

export const themes: Record<ThemeType, ThemeColors> = {
  dark: {
    background: '#0e0e0e',
    surface: '#1a1919',
    'surface-low': '#131313',
    'surface-high': '#201f1f',
    'surface-highest': '#262626',
    primary: '#e9ffbd',
    'primary-container': '#b5fe00',
    'on-primary': '#476700',
    secondary: '#00e0ff',
    tertiary: '#ff7168',
    error: '#ff7351',
    outline: '#777575',
    'on-surface': '#ffffff',
    'on-surface-variant': '#adaaaa',
  },
  neon: {
    background: '#000000',
    surface: '#0a0a0a',
    'surface-low': '#050505',
    'surface-high': '#1a1a1a',
    'surface-highest': '#2a2a2a',
    primary: '#b5fe00',
    'primary-container': '#e9ffbd',
    'on-primary': '#324a00',
    secondary: '#00d1ee',
    tertiary: '#e2242a',
    error: '#d53d18',
    outline: '#494847',
    'on-surface': '#ffffff',
    'on-surface-variant': '#adaaaa',
  },
  light: {
    background: '#fcf8f8',
    surface: '#ffffff',
    'surface-low': '#f3f3f3',
    'surface-high': '#ececec',
    'surface-highest': '#e0e0e0',
    primary: '#496900',
    'primary-container': '#b5fe00',
    'on-primary': '#ffffff',
    secondary: '#006877',
    tertiary: '#9c413d',
    error: '#ba1b1b',
    outline: '#79747e',
    'on-surface': '#1c1b1b',
    'on-surface-variant': '#49454f',
  },
};
