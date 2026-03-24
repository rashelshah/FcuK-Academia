'use client';

const inflightRequests = new Map<string, Promise<unknown>>();
const responseCache = new Map<string, { expiresAt: number; data: unknown }>();
const CLIENT_CACHE_TTL_MS = 15 * 1000;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const requestKey = JSON.stringify({
    input: typeof input === 'string' ? input : input.toString(),
    method: init?.method ?? 'GET',
    body: typeof init?.body === 'string' ? init.body : null,
  });

  const cached = responseCache.get(requestKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }

  const existing = inflightRequests.get(requestKey);
  if (existing) {
    return existing as Promise<T>;
  }

  const request = (async () => {
    const response = await fetch(input, {
      ...init,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        typeof data?.error === 'string' ? data.error : 'server error',
        response.status,
      );
    }

    responseCache.set(requestKey, {
      expiresAt: Date.now() + CLIENT_CACHE_TTL_MS,
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
