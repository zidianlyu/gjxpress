// Public API functions (no auth required)

import { publicApiFetch } from './client';
import type { PublicTrackingResult, PublicBatchUpdate, PublicCustomerRegistrationResponse } from '@/types/public';
import type { PaginatedResponse } from '@/types/api';
import type { CreateCustomerRegistrationPayload } from '@/types/admin';

export const publicApi = {
  tracking: (query: string) =>
    publicApiFetch<PublicTrackingResult>(`/public/tracking?query=${encodeURIComponent(query)}`),

  getBatchUpdates: (params?: { page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    const qs = searchParams.toString();
    return publicApiFetch<PaginatedResponse<PublicBatchUpdate>>(
      `/public/batch-updates${qs ? `?${qs}` : ''}`
    );
  },

  getBatchUpdateByBatchNo: (batchNo: string) =>
    publicApiFetch<PublicBatchUpdate>(`/public/batch-updates/${encodeURIComponent(batchNo)}`),

  health: () =>
    publicApiFetch<{ status: string; service: string; timestamp: string }>('/health'),

  createCustomerRegistration: (data: CreateCustomerRegistrationPayload) =>
    publicApiFetch<PublicCustomerRegistrationResponse>('/public/customer-registrations', {
      method: 'POST',
      body: data,
    }),
};
