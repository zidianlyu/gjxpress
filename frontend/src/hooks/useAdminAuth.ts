'use client';

import { useSyncExternalStore, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken, getAdminUser, clearAdminToken } from '@/lib/api/admin-auth';
import type { AdminUser } from '@/types/admin';

function getSnapshot(): { token: string | null; user: AdminUser | null } {
  if (typeof window === 'undefined') return { token: null, user: null };
  return { token: getAdminToken(), user: getAdminUser() };
}

function getServerSnapshot(): { token: string | null; user: AdminUser | null } {
  return { token: null, user: null };
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function useAdminAuth() {
  const router = useRouter();
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isAuthenticated = !!state.token;
  const user = state.user;
  const isLoading = false; // sync check, no loading needed

  const logout = useCallback(() => {
    clearAdminToken();
    router.push('/admin/login');
  }, [router]);

  return { isLoading, isAuthenticated, user, logout };
}
