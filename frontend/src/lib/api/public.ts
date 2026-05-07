// Public API functions (no auth required)

import { publicApiFetch } from './client';
import type { PublicTrackingResult, PublicBatchUpdate, PublicCustomerRegistrationResponse } from '@/types/public';
import type { CreateCustomerRegistrationPayload } from '@/types/admin';
import { normalizeTrackingQuery, unwrapApiItem, unwrapApiList } from '@/lib/public-tracking';

export const publicApi = {
  tracking: async (query: string) => {
    const normalized = normalizeTrackingQuery(query);
    const response = await publicApiFetch<unknown>(`/tracking?q=${encodeURIComponent(normalized)}`);
    return unwrapApiItem<PublicTrackingResult>(response.data);
  },

  getBatchUpdates: async (params?: { limit?: number; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    const qs = searchParams.toString();
    const response = await publicApiFetch<unknown>(
      `/tracking/batch-updates${qs ? `?${qs}` : ''}`
    );
    return unwrapApiList<PublicBatchUpdate>(response.data).sort((a, b) => {
      const left = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const right = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return right - left;
    });
  },

  getBatchUpdateByBatchNo: (batchNo: string) =>
    publicApiFetch<PublicBatchUpdate>(`/tracking/batch-updates/${encodeURIComponent(batchNo)}`),

  health: () =>
    publicApiFetch<{ status: string; service: string; timestamp: string }>('/health'),

  createCustomerRegistration: (data: CreateCustomerRegistrationPayload) =>
    publicApiFetch<PublicCustomerRegistrationResponse>('/public/customer-registrations', {
      method: 'POST',
      body: data,
    }),
};
