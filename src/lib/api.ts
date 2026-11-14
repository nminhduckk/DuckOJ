let accessTokenMemory: string | null = null;

export function setAccessToken(token: string | null) {
  accessTokenMemory = token;
}

export function getAccessToken(): string | null {
  return accessTokenMemory;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details: Record<string, unknown>;

  constructor(status: number, code: string, message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function refreshSession(): Promise<string | null> {
  try {
    const res = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'duckoj',
      },
      credentials: 'include',
    });
    if (!res.ok) {
      accessTokenMemory = null;
      return null;
    }
    const data = await res.json();
    accessTokenMemory = data.access_token || null;
    return accessTokenMemory;
  } catch {
    accessTokenMemory = null;
    return null;
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit & { skipRetry?: boolean } = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessTokenMemory) {
    headers.set('Authorization', `Bearer ${accessTokenMemory}`);
  }

  let res = await fetch(`/api/v1${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && !options.skipRetry && !path.startsWith('/auth/')) {
    const nextToken = await refreshSession();
    if (nextToken) {
      headers.set('Authorization', `Bearer ${nextToken}`);
      res = await fetch(`/api/v1${path}`, {
        ...options,
        headers,
        credentials: 'include',
      });
    }
  }

  if (!res.ok) {
    let errBody: any = null;
    try {
      errBody = await res.json();
    } catch {
      // ignore non-json
    }
    const errObj = errBody?.error || {};
    throw new ApiError(
      res.status,
      errObj.code || 'request_failed',
      errObj.message || `Lỗi máy chủ (${res.status})`,
      errObj.details || {}
    );
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export { refreshSession };
