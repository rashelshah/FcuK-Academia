import type { FeedbackPayload, FeedbackResponse } from '@/lib/feedback/types';

// ─── Feedback API Client ───────────────────────────────────────────────────────

export async function submitFeedback(payload: FeedbackPayload): Promise<FeedbackResponse> {
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json() as FeedbackResponse;

  if (!response.ok) {
    return { success: false, message: data.message ?? 'Something went wrong. Please try again.' };
  }

  return data;
}
