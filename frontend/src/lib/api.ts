// The one place that knows where the backend is. Change BASE for a deployed API.
const BASE = '/api';
const TOKEN_KEY = 'app.token';

// ponytail: localStorage is XSS-readable; move to an httpOnly cookie (backend work) for production.
export const token = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (value: string) => localStorage.setItem(TOKEN_KEY, value),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/** Set by the router so a 401 anywhere sends the user to /login. */
export const onUnauthorized: { handler: () => void } = { handler: () => {} };

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function send<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');
  const jwt = token.get();
  if (jwt) headers.set('Authorization', `Bearer ${jwt}`);

  const response = await fetch(BASE + path, { ...init, headers });
  const body: { message?: string | string[]; data?: unknown } | null =
    response.status === 204
      ? null
      : ((await response.json().catch(() => null)) as {
          message?: string | string[];
          data?: unknown;
        } | null);

  // A failed sign-in is also a 401; only a rejected session should log out.
  if (response.status === 401 && jwt) {
    token.clear();
    onUnauthorized.handler();
  }
  if (!response.ok) {
    const message = body?.message;
    throw new ApiError(
      (Array.isArray(message) ? message.join('، ') : message) ||
        'درخواست ناموفق بود',
      response.status,
    );
  }
  // REST wraps payloads in { success, statusCode, data, timestamp }.
  return (body?.data ?? body) as T;
}

export const api = {
  get: <T>(path: string) => send<T>(path),
  post: <T>(path: string, data: unknown) =>
    send<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  delete: (path: string) => send<void>(path, { method: 'DELETE' }),
};
