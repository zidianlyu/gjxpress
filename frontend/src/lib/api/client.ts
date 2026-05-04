// Shared API client for GJXpress frontend
// This client only calls NEXT_PUBLIC_API_BASE_URL

import { SITE_CONFIG } from '@/lib/constants';

// API Response types
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

// API Error class
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Base API fetch function
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl = SITE_CONFIG.apiBaseUrl;
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorCode = data?.error?.code || 'UNKNOWN_ERROR';
    const errorMessage = data?.error?.message || `API Error: ${response.status}`;
    throw new ApiError(errorCode, errorMessage, response.status, data?.error?.details);
  }

  if (!data || !data.success) {
    const errorCode = data?.error?.code || 'API_ERROR';
    const errorMessage = data?.error?.message || '请求失败';
    throw new ApiError(errorCode, errorMessage, response.status, data?.error?.details);
  }

  return data;
}

// Public API functions (no auth required)
export const publicApi = {
  // Health check
  health: () => apiFetch<{ status: string; service: string; timestamp: string }>('/health'),

  // Recommendations (for future recommendation system)
  getRecommendations: (params?: { city?: string; category?: string; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.city) searchParams.set('city', params.city);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    const query = searchParams.toString();
    return apiFetch<PaginatedResponse<Recommendation>>(`/public/recommendations${query ? `?${query}` : ''}`);
  },

  getRecommendationBySlug: (slug: string) =>
    apiFetch<Recommendation>(`/public/recommendations/${slug}`),
};

// Types for public API
export interface Recommendation {
  id: string;
  slug: string;
  name: string;
  title: string;
  city: string;
  category: string;
  summary: string;
  description?: string;
  tags: string[];
  imageUrl?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}
