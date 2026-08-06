import type { FeedbackPriority, FeedbackType } from './types';

// ─── Feedback Presets ─────────────────────────────────────────────────────────

export const FEEDBACK_PRESETS: Record<FeedbackType, string[]> = {
  bug: [
    'Attendance calculation issue',
    'Theme issue',
    'Animation issue',
    'Performance issue',
    'UI glitch',
    'Navigation issue',
    'Notification issue',
    'Loading issue',
    'Login issue',
    'Crash',
    'Other',
  ],
  feature: [
    'New feature',
    'Theme suggestion',
    'Attendance tools',
    'Lock In improvement',
    'Rate My Faculty improvement',
    'UI enhancement',
    'Customization',
    'Notifications',
    'Performance improvement',
    'Other',
  ],
  incorrect_data: [
    'Attendance mismatch',
    'Wrong timetable',
    'Wrong marks',
    'Faculty information',
    'Subject information',
    'Room information',
    'Other',
  ],
  general: [
    'Love the UI',
    'Great experience',
    'Easy to use',
    'Very helpful',
    'Needs improvement',
    'Suggestion',
    'Other',
  ],
};

// ─── Priority Rules ────────────────────────────────────────────────────────────

const HIGH_PRIORITY_PRESETS = new Set([
  'Crash',
  'Login issue',
  'Attendance mismatch',
  'Attendance calculation issue',
  'Wrong marks',
]);

const LOW_PRIORITY_PRESETS = new Set([
  'Love the UI',
  'Great experience',
  'Easy to use',
  'Very helpful',
  'Other',
]);

export function computePriority(
  _type: FeedbackType,
  presets: string[]
): FeedbackPriority {
  if (presets.some((p) => HIGH_PRIORITY_PRESETS.has(p))) return 'HIGH';
  if (presets.some((p) => LOW_PRIORITY_PRESETS.has(p))) return 'LOW';
  return 'MEDIUM';
}

// ─── ID Generator ─────────────────────────────────────────────────────────────

const PREFIX_MAP: Record<FeedbackType, string> = {
  bug: 'BUG',
  feature: 'FEATURE',
  incorrect_data: 'DATA',
  general: 'FB',
};

export function generateFeedbackId(type: FeedbackType): string {
  const prefix = PREFIX_MAP[type];
  const num = (Date.now() % 9000) + 1000;
  return `${prefix}-${num}`;
}

// ─── Placeholder Text ─────────────────────────────────────────────────────────

export const FEEDBACK_PLACEHOLDERS: Record<FeedbackType, string> = {
  bug: 'Describe the issue in detail — what happened, when, and what you expected…',
  feature: 'Tell us your idea — what would you build if you could?',
  incorrect_data: 'What data looks wrong? Share what you see vs. what you expect…',
  general: 'What could be improved? Every thought counts.',
};

// ─── Type Metadata ─────────────────────────────────────────────────────────────

export const FEEDBACK_TYPES: {
  id: FeedbackType;
  icon: string;
  title: string;
  description: string;
}[] = [
  {
    id: 'bug',
    icon: '🐞',
    title: 'Report a Bug',
    description: 'Something broken, unexpected, or just wrong?',
  },
  {
    id: 'feature',
    icon: '💡',
    title: 'Suggest a Feature',
    description: 'Have an idea that would make things better?',
  },
  {
    id: 'incorrect_data',
    icon: '📊',
    title: 'Report Incorrect Data',
    description: 'Attendance, marks, or timetable not matching?',
  },
  {
    id: 'general',
    icon: '❤️',
    title: 'General Feedback',
    description: 'Love it, hate it, or something in between?',
  },
];
