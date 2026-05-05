// Shared API client for GJXpress frontend
// All API calls go through this unified client.
// Never hardcode backend URLs in page components.

import { getApiBaseUrl } from '@/lib/env';

// ─── Debug Config ────────────────────────────────────────────
function isDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const envDebug = process.env.NEXT_PUBLIC_API_DEBUG;
  if (envDebug === 'false') return false;
  if (envDebug === 'true') return true;
  return process.env.NODE_ENV === 'development';
}

function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// ─── API Response types ──────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ─── API Error class ─────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public details?: Record<string, unknown>,
    public requestId?: string,
    public backendRequestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Options ─────────────────────────────────────────────────
export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string;
}

/**
 * Core fetch function. All API calls should use this.
 * - Normalizes base URL (auto-appends /api if needed)
 * - Generates X-Request-Id for every request
 * - Logs [API:start], [API:success], [API:error] to console in debug mode
 * - Handles JSON serialization
 * - Handles error responses
 * - Never logs token, password, or Authorization header
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const method = (options.method || 'GET').toUpperCase();
  const requestId = generateRequestId();
  const startTime = Date.now();
  const debug = isDebugEnabled();

  const { body, token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Request-Id': requestId,
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // [API:start] log
  if (debug) {
    console.log('[API:start]', {
      requestId,
      method,
      url,
      path,
      hasBody: body != null,
      hasToken: !!token,
    });
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
    });
  } catch {
    const durationMs = Date.now() - startTime;
    if (debug) {
      console.error('[API:error]', {
        requestId,
        backendRequestId: null,
        method,
        path,
        status: 0,
        durationMs,
        message: '网络连接失败',
      });
    }
    throw new ApiError('NETWORK_ERROR', '网络连接失败，请检查网络后重试', 0, undefined, requestId);
  }

  const durationMs = Date.now() - startTime;
  const backendRequestId = response.headers.get('x-request-id') || undefined;
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorCode = data?.error?.code || `HTTP_${response.status}`;
    const errorMessage = data?.error?.message || data?.message || `请求失败 (${response.status})`;
    if (debug) {
      console.error('[API:error]', {
        requestId,
        backendRequestId,
        method,
        path,
        status: response.status,
        durationMs,
        message: errorMessage,
      });
    }
    throw new ApiError(errorCode, errorMessage, response.status, data?.error?.details, requestId, backendRequestId);
  }

  // Backend wraps in { success, data, error }
  if (data && typeof data.success === 'boolean') {
    if (!data.success) {
      const errorCode = data.error?.code || 'API_ERROR';
      const errorMessage = data.error?.message || '请求失败';
      if (debug) {
        console.error('[API:error]', {
          requestId,
          backendRequestId,
          method,
          path,
          status: response.status,
          durationMs,
          message: errorMessage,
        });
      }
      throw new ApiError(errorCode, errorMessage, response.status, data.error?.details, requestId, backendRequestId);
    }
    // [API:success] log
    if (debug) {
      console.log('[API:success]', {
        requestId,
        backendRequestId,
        method,
        path,
        status: response.status,
        durationMs,
      });
    }
    return data;
  }

  // Fallback: wrap raw response
  if (debug) {
    console.log('[API:success]', {
      requestId,
      backendRequestId,
      method,
      path,
      status: response.status,
      durationMs,
    });
  }
  return { success: true, data: data as T };
}

/**
 * Public API fetch - no authentication required.
 */
export async function publicApiFetch<T>(
  path: string,
  options: Omit<ApiFetchOptions, 'token'> = {}
): Promise<ApiResponse<T>> {
  return apiFetch<T>(path, options);
}
