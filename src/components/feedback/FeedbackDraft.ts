import type { FeedbackDraft } from '@/lib/feedback/types';

// ─── Draft Recovery ───────────────────────────────────────────────────────────

const DRAFT_KEY = 'fcuk_feedback_draft';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function saveDraft(draft: FeedbackDraft): void {
  if (typeof window === 'undefined') return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Storage quota exceeded — silently ignore
    }
  }, 500);
}

export function loadDraft(): FeedbackDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as FeedbackDraft;
    // Discard drafts older than 2 hours
    if (Date.now() - draft.savedAt > 2 * 60 * 60 * 1000) {
      clearDraft();
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  if (debounceTimer) clearTimeout(debounceTimer);
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

export function hasMeaningfulDraft(draft: FeedbackDraft | null): boolean {
  if (!draft) return false;
  return draft.type !== null || draft.presets.length > 0 || draft.message.trim().length > 0;
}
