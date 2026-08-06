import { NextRequest, NextResponse } from 'next/server';
import { generateFeedbackId, computePriority } from '@/lib/feedback/presets';
import { validateFeedbackPayload, computeSubmissionHash, sanitizeString } from '@/lib/feedback/validators';
import { sendFeedback } from '@/lib/feedback/providers';
import type { FeedbackPayload } from '@/lib/feedback/types';

// ─── In-Memory Rate Limiting ──────────────────────────────────────────────────
// Works for single-instance deployments (Vercel serverless).
// Swap Map → Redis/Upstash for multi-instance setups.

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5;
const DUPLICATE_WINDOW_MS = 60 * 1000; // 60 seconds
const MAX_PAYLOAD_BYTES = 8 * 1024; // 8 KB

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const duplicateHashMap = new Map<string, number>(); // hash → expiresAt

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count++;
  return true;
}

function checkDuplicate(hash: string): boolean {
  const now = Date.now();
  const expiresAt = duplicateHashMap.get(hash);

  if (expiresAt && expiresAt > now) return false; // duplicate

  duplicateHashMap.set(hash, now + DUPLICATE_WINDOW_MS);
  return true;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // ── Payload size guard ─────────────────────────────────────────────────
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
      return NextResponse.json({ success: false, message: 'Payload too large.' }, { status: 400 });
    }

    // ── Parse body ─────────────────────────────────────────────────────────
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid JSON.' }, { status: 400 });
    }

    // ── Honeypot check ─────────────────────────────────────────────────────
    // Return 200 to confuse bots — they think they succeeded.
    if (body && typeof body === 'object' && (body as Record<string, unknown>).honeypot) {
      return NextResponse.json({ success: true, message: 'Feedback received.' }, { status: 200 });
    }

    // ── Validate payload ───────────────────────────────────────────────────
    const validation = validateFeedbackPayload(body);
    if (!validation.valid) {
      return NextResponse.json({ success: false, message: validation.error }, { status: 400 });
    }

    const payload = body as FeedbackPayload;

    // Sanitize user-supplied strings
    payload.customMessage = sanitizeString(payload.customMessage);
    payload.selectedPresets = payload.selectedPresets
      .map(sanitizeString)
      .filter(Boolean)
      .slice(0, 11);

    // ── Rate limiting ──────────────────────────────────────────────────────
    const ip = getClientIp(req);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many submissions. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    // ── Duplicate detection ────────────────────────────────────────────────
    const hash = computeSubmissionHash(payload);
    if (!checkDuplicate(hash)) {
      return NextResponse.json(
        { success: false, message: 'Please wait a moment before submitting the same feedback again.' },
        { status: 429 }
      );
    }

    // ── Generate ID + Priority ─────────────────────────────────────────────
    const feedbackId = generateFeedbackId(payload.feedbackType);
    const priority = computePriority(payload.feedbackType, payload.selectedPresets);

    // ── Dispatch to provider ───────────────────────────────────────────────
    const { ok } = await sendFeedback(payload, feedbackId, priority);

    if (!ok) {
      // Provider failed — still return success to user (retry on our end is a future concern)
      console.error('[feedback] Provider dispatch failed for', feedbackId);
    }

    return NextResponse.json(
      { success: true, feedbackId, message: 'Feedback received. Thank you!' },
      { status: 200 }
    );
  } catch (err) {
    // Never expose internal errors to client
    console.error('[feedback] Unhandled error:', err);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
