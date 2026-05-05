// Admin authentication utilities
// Phase 1: localStorage-based token storage
// TODO Phase 2: upgrade to httpOnly cookie + middleware

import { apiFetch, ApiError } from './client';
import type { AdminLoginRequest, AdminLoginResponse, AdminUser } from '@/types/admin';

const TOKEN_KEY = 'gjx_admin_access_token';
const USER_KEY = 'gjx_admin_user';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function setAdminUser(user: AdminUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAdminAuthenticated(): boolean {
  return !!getAdminToken();
}

export async function adminLogin(req: AdminLoginRequest): Promise<AdminLoginResponse> {
  const response = await apiFetch<AdminLoginResponse>('/auth/admin-login', {
    method: 'POST',
    body: req,
  });

  const { accessToken, admin } = response.data;
  setAdminToken(accessToken);
  setAdminUser(admin);
  return response.data;
}

export function adminLogout(): void {
  clearAdminToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/admin/login';
  }
}

/**
 * Admin API fetch - attaches Bearer token automatically.
 * On 401, clears token and redirects to login.
 */
export async function adminApiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const token = getAdminToken();
  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
    throw new ApiError('UNAUTHORIZED', '未登录，请先登录', 401);
  }

  try {
    const response = await apiFetch<T>(path, {
      ...options,
      token,
    });
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearAdminToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    }
    throw error;
  }
}
