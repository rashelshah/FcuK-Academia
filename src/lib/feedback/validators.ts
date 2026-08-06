import type { FeedbackPayload, FeedbackType } from './types';

// ─── Payload Validator ────────────────────────────────────────────────────────

const VALID_TYPES = new Set<FeedbackType>(['bug', 'feature', 'incorrect_data', 'general']);
const MAX_MESSAGE_LENGTH = 500;
const MAX_PRESET_COUNT = 11;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function sanitizeString(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\0/g, '')           // strip null bytes
    .replace(/\r\n/g, '\n')       // normalize line endings
    .trim();
}

export function validateFeedbackPayload(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid payload.' };
  }

  const payload = body as Record<string, unknown>;

  // Type check
  if (!VALID_TYPES.has(payload.feedbackType as FeedbackType)) {
    return { valid: false, error: 'Invalid feedback type.' };
  }

  // Presets check
  const presets = payload.selectedPresets;
  if (!Array.isArray(presets) || presets.length > MAX_PRESET_COUNT) {
    return { valid: false, error: 'Invalid presets.' };
  }

  // Message sanitize
  const message = sanitizeString(payload.customMessage);
  const hasPresets = presets.length > 0;
  const hasMessage = message.length > 0;

  if (!hasPresets && !hasMessage) {
    return { valid: false, error: 'Please select a preset or write a description.' };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Message must be under ${MAX_MESSAGE_LENGTH} characters.` };
  }

  return { valid: true };
}

// ─── Duplicate Hash ───────────────────────────────────────────────────────────

export function computeSubmissionHash(payload: Pick<FeedbackPayload, 'feedbackType' | 'selectedPresets' | 'customMessage'>): string {
  const raw = `${payload.feedbackType}|${[...payload.selectedPresets].sort().join(',')}|${payload.customMessage.trim()}`;
  // Simple djb2 hash — no crypto needed, just needs to be consistent
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash) ^ raw.charCodeAt(i);
    hash = hash >>> 0; // force unsigned 32-bit
  }
  return hash.toString(16);
}
