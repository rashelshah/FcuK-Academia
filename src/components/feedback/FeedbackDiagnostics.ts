import type { FeedbackDiagnostics } from '@/lib/feedback/types';

// ─── Auto-collected Diagnostics ───────────────────────────────────────────────
// Pure utility — no React, no side effects, safe to call anywhere client-side.

function detectBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\//i.test(ua)) return 'Opera';
  if (/chrome/i.test(ua)) return 'Chrome';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua)) return 'Safari';
  return 'Unknown';
}

function detectOS(ua: string): string {
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/windows/i.test(ua)) return 'Windows';
  if (/mac os x/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Unknown';
}

function detectPlatform(ua: string, pwa: boolean): string {
  const os = detectOS(ua);
  return pwa ? `${os} PWA` : os;
}

function isPWA(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

export function collectDiagnostics(): FeedbackDiagnostics {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const pwa = isPWA();
  const now = new Date();

  const theme =
    typeof document !== 'undefined'
      ? (document.documentElement.dataset.theme ?? 'unknown')
      : 'unknown';

  const personalityMode =
    typeof localStorage !== 'undefined'
      ? (localStorage.getItem('fcuk_personality_mode') ?? 'fcuk_academia')
      : 'fcuk_academia';

  const timestamp = now.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return {
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0',
    route: typeof window !== 'undefined' ? window.location.pathname : '/',
    theme,
    personalityMode,
    platform: detectPlatform(ua, pwa),
    browser: detectBrowser(ua),
    os: detectOS(ua),
    viewportSize: typeof window !== 'undefined'
      ? `${window.innerWidth}x${window.innerHeight}`
      : 'unknown',
    pwaInstalled: pwa,
    language: typeof navigator !== 'undefined' ? navigator.language : 'en',
    timestamp,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    userAgent: ua,
  };
}
