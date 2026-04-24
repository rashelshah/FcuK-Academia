'use client';

const inflightRequests = new Map<string, Promise<unknown>>();
const responseCache = new Map<string, { expiresAt: number; data: unknown }>();

// ── JS-layer cache TTLs (in-memory, per-tab) ──────────────────────────────
// These are the primary deduplication layer within a single browser tab.
// The browser's HTTP cache (respected after removing cache:'no-store') gives
// an additional cross-tab dedup layer at the timescales set by Cache-Control.
const CACHE_TTLS: Record<string, number> = {
  '/api/dashboard': 90 * 1000,        // 90s — always cleared before load; this TTL covers peekCachedJson seeding
  '/api/attendance': 90 * 1000,       // 90s
  '/api/marks': 90 * 1000,            // 90s
  '/api/calendar': 10 * 60 * 1000,   // 10 min — semi-static
  '/api/timetable': 10 * 60 * 1000,  // 10 min — semi-static
  '/api/pyqs': 60 * 60 * 1000,       // 1 hour — static
};
const DEFAULT_TTL_MS = 5 * 60 * 1000;

function getTtlMs(url: string): number {
  for (const [prefix, ttl] of Object.entries(CACHE_TTLS)) {
    if (url.includes(prefix)) return ttl;
  }
  return DEFAULT_TTL_MS;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getRequestCacheKey(input: RequestInfo | URL, init?: RequestInit) {
  return JSON.stringify({
    input: typeof input === 'string' ? input : input.toString(),
    method: init?.method ?? 'GET',
    body: typeof init?.body === 'string' ? init.body : null,
  });
}

export function peekCachedJson<T>(input: RequestInfo | URL, init?: RequestInit): T | null {
  const cached = responseCache.get(getRequestCacheKey(input, init));
  if (!cached || cached.expiresAt <= Date.now()) {
    return null;
  }

  return cached.data as T;
}

export function clearCachedJson(match?: string) {
  for (const key of responseCache.keys()) {
    if (!match || key.includes(match)) {
      responseCache.delete(key);
    }
  }
}

export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const requestKey = getRequestCacheKey(input, init);
  const url = typeof input === 'string' ? input : input.toString();

  // 1. JS in-memory cache (fastest — no network, no browser cache lookup).
  const cached = responseCache.get(requestKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }

  // 2. Inflight deduplication — if the same request is already in-flight,
  //    share the same Promise rather than firing a second network call.
  const existing = inflightRequests.get(requestKey);
  if (existing) {
    return existing as Promise<T>;
  }

  const request = (async () => {
    const response = await fetch(input, {
      // cache:'default' first so callers can override via ...init.
      // For background syncs, DashboardDataContext clears the JS Map before
      // calling fetchJson, ensuring the browser HTTP cache is the last
      // dedup layer (max-age=5s for real-time routes).
      cache: 'default',
      ...init,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        typeof data?.error === 'string' ? data.error : 'server error',
        response.status,
      );
    }

    // Populate the JS-layer cache with an endpoint-appropriate TTL.
    responseCache.set(requestKey, {
      expiresAt: Date.now() + getTtlMs(url),
      data,
    });

    return data as T;
  })();

  inflightRequests.set(requestKey, request);

  try {
    return await request;
  } finally {
    inflightRequests.delete(requestKey);
  }
}
