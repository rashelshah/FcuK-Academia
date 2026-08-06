// ─── Feedback System Types ─────────────────────────────────────────────────

export type FeedbackType = 'bug' | 'feature' | 'incorrect_data' | 'general';

export type FeedbackPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface FeedbackDiagnostics {
  appVersion: string;
  route: string;
  theme: string;
  personalityMode: string;
  platform: string;
  browser: string;
  os: string;
  viewportSize: string;
  pwaInstalled: boolean;
  language: string;
  timestamp: string;
  timezone: string;
  userAgent: string;
}

export interface FeedbackPayload {
  feedbackType: FeedbackType;
  selectedPresets: string[];
  customMessage: string;
  diagnostics: FeedbackDiagnostics;
  /** Honeypot field — always empty for real users. Bots fill it. */
  honeypot: string;
}

export interface FeedbackDraft {
  type: FeedbackType | null;
  presets: string[];
  message: string;
  savedAt: number;
}

export interface FeedbackResponse {
  success: boolean;
  feedbackId?: string;
  message: string;
}
