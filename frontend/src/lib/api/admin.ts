// Admin API endpoints for Web Logistics Phase 1
// Uses adminApiFetch from admin-auth.ts which auto-attaches Bearer token

import { adminApiFetch } from './admin-auth';
import { unwrapApiItem } from './unwrap';
import type { PaginatedResponse } from '@/types/api';
import type {
  Customer,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  InboundPackage,
  CreateInboundPackagePayload,
  CustomerShipment,
  CreateCustomerShipmentPayload,
  UpdateCustomerShipmentPayload,
  MasterShipment,
  CreateMasterShipmentPayload,
  TransactionRecord,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  DeleteResponse,
  CustomerRegistration,
  CreateCustomerRegistrationPayload,
  UpdateCustomerRegistrationPayload,
  ApproveCustomerRegistrationResponse,
} from '@/types/admin';

type PaginationLike<T> =
  | T[]
  | {
      data?: PaginationLike<T>;
      item?: PaginationLike<T>;
      items?: T[];
      page?: number;
      pageSize?: number;
      total?: number;
      totalPages?: number;
      pagination?: {
        page?: number;
        pageSize?: number;
        total?: number;
        totalPages?: number;
      };
    };

type ItemLike<T> = T | { data?: T; item?: T };

// File upload helper — uses FormData, skips JSON Content-Type
async function adminApiUpload<T>(
  path: string,
  file: File,
  fieldName = 'file'
): Promise<T> {
  const { getAdminToken, clearAdminToken } = await import('./admin-auth');
  const { getApiBaseUrl } = await import('@/lib/env');
  const { ApiError } = await import('./client');

  const token = getAdminToken();
  if (!token) {
    if (typeof window !== 'undefined') window.location.href = '/admin/login';
    throw new ApiError('UNAUTHORIZED', '未登录，请先登录', 401);
  }

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const requestId = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const formData = new FormData();
  formData.append(fieldName, file);

  const debug = process.env.NODE_ENV === 'development';
  if (debug) {
    console.log('[API:upload]', { requestId, path, fileName: file.name, fileSize: file.size });
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Request-Id': requestId,
      },
      body: formData,
    });
  } catch {
    throw new ApiError('NETWORK_ERROR', '网络连接失败，请检查网络后重试', 0, undefined, requestId);
  }

  if (response.status === 401) {
    clearAdminToken();
    if (typeof window !== 'undefined') window.location.href = '/admin/login';
    throw new ApiError('UNAUTHORIZED', '未登录', 401, undefined, requestId);
  }

  const data = await response.json().catch(() => null);
  const backendRequestId = response.headers.get('x-request-id') || undefined;

  if (!response.ok) {
    const msg = data?.error?.message || data?.message || `上传失败 (${response.status})`;
    throw new ApiError(data?.error?.code || `HTTP_${response.status}`, msg, response.status, data?.error?.details, requestId, backendRequestId);
  }

  if (data && typeof data.success === 'boolean') {
    if (!data.success) {
      throw new ApiError(data.error?.code || 'API_ERROR', data.error?.message || '上传失败', response.status, data.error?.details, requestId, backendRequestId);
    }
    return data.data;
  }
  return data as T;
}

// Re-export auth utilities for backward compatibility
export {
  adminLogin,
  adminLogout,
  getAdminToken,
  getAdminUser,
  isAdminAuthenticated,
  clearAdminToken,
} from './admin-auth';

// Helper to build query string
function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') {
      sp.set(key, String(value));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

function normalizePagination<T>(
  value: PaginationLike<T>,
  fallbackPage = 1,
  fallbackPageSize = 20
): PaginatedResponse<T> {
  if (!Array.isArray(value)) {
    if (value.data != null) return normalizePagination(value.data, fallbackPage, fallbackPageSize);
    if (value.item != null) return normalizePagination(value.item, fallbackPage, fallbackPageSize);
  }

  if (Array.isArray(value)) {
    return {
      items: value,
      page: fallbackPage,
      pageSize: fallbackPageSize,
      total: value.length,
      totalPages: Math.max(1, Math.ceil(value.length / fallbackPageSize)),
      pagination: {
        page: fallbackPage,
        pageSize: fallbackPageSize,
        total: value.length,
        totalPages: Math.max(1, Math.ceil(value.length / fallbackPageSize)),
      },
    };
  }

  const nested = value.pagination;
  const items = Array.isArray(value.items) ? value.items : [];
  const page = Number(value.page ?? nested?.page ?? fallbackPage) || fallbackPage;
  const pageSize = Number(value.pageSize ?? nested?.pageSize ?? fallbackPageSize) || fallbackPageSize;
  const total = Number(value.total ?? nested?.total ?? items.length) || 0;
  const totalPages = Math.max(
    1,
    Number(value.totalPages ?? nested?.totalPages ?? Math.ceil(total / pageSize)) || 1
  );

  return {
    items,
    page,
    pageSize,
    total,
    totalPages,
    pagination: { page, pageSize, total, totalPages },
  };
}

function cleanInboundPackagePayload(data: CreateInboundPackagePayload): CreateInboundPackagePayload {
  const domesticTrackingNo = data.domesticTrackingNo?.trim();
  const customerCode = data.customerCode?.trim();
  return {
    ...data,
    domesticTrackingNo: domesticTrackingNo || null,
    customerCode: customerCode || '',
    note: data.note?.trim() || undefined,
  };
}

export const adminApi = {
  // === Customers ===
  listCustomers: async (params?: { q?: string; page?: number; pageSize?: number }) => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const data = await adminApiFetch<PaginationLike<Customer>>(
      `/admin/customers${buildQuery(params || {})}`
    );
    return normalizePagination(data, page, pageSize);
  },

  getCustomers: (params?: { q?: string; page?: number; pageSize?: number }) =>
    adminApi.listCustomers(params),

  getCustomerById: async (id: string) =>
    unwrapApiItem(await adminApiFetch<ItemLike<Customer>>(`/admin/customers/${id}`)),

  createCustomer: (data: CreateCustomerPayload) =>
    adminApiFetch<ItemLike<Customer>>('/admin/customers', { method: 'POST', body: data }).then((res) => unwrapApiItem(res)),

  updateCustomer: async (id: string, data: UpdateCustomerPayload) =>
    unwrapApiItem(await adminApiFetch<ItemLike<Customer>>(`/admin/customers/${id}`, { method: 'PATCH', body: data })),

  // === Inbound Packages ===
  listInboundPackages: async (params?: { q?: string; status?: string; customerId?: string; customerCode?: string; page?: number; pageSize?: number }) => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const data = await adminApiFetch<PaginationLike<InboundPackage>>(
      `/admin/inbound-packages${buildQuery(params || {})}`
    );
    return normalizePagination(data, page, pageSize);
  },

  getInboundPackages: (params?: { q?: string; status?: string; customerId?: string; customerCode?: string; page?: number; pageSize?: number }) =>
    adminApi.listInboundPackages(params),

  getInboundPackageById: async (id: string) =>
    unwrapApiItem(await adminApiFetch<ItemLike<InboundPackage>>(`/admin/inbound-packages/${id}`)),

  createInboundPackage: async (data: CreateInboundPackagePayload) =>
    unwrapApiItem(await adminApiFetch<ItemLike<InboundPackage>>('/admin/inbound-packages', { method: 'POST', body: cleanInboundPackagePayload(data) })),

  updateInboundPackage: (id: string, data: Partial<{
    domesticTrackingNo: string | null;
    customerCode: string | null;
    warehouseReceivedAt: string | null;
    note: string | null;
    status: string;
  }>) => adminApiFetch<ItemLike<InboundPackage>>(`/admin/inbound-packages/${id}`, { method: 'PATCH', body: data }).then((res) => unwrapApiItem(res)),

  assignCustomerToPackage: (id: string, data: { customerCode: string }) =>
    adminApiFetch<ItemLike<InboundPackage>>(`/admin/inbound-packages/${id}/assign-customer`, { method: 'PATCH', body: data }).then((res) => unwrapApiItem(res)),

  updateInboundPackageStatus: (id: string, data: { status: string }) =>
    adminApiFetch<ItemLike<InboundPackage>>(`/admin/inbound-packages/${id}/status`, { method: 'PATCH', body: data }).then((res) => unwrapApiItem(res)),

  // Inbound Package images
  listInboundPackageImages: (id: string) =>
    adminApiFetch<string[]>(`/admin/inbound-packages/${id}/images`),

  uploadInboundPackageImage: (id: string, file: File) =>
    adminApiUpload<{ url: string }>(`/admin/inbound-packages/${id}/images`, file),

  deleteInboundPackageImage: (id: string, imageUrl: string) =>
    adminApiFetch<{ deleted: boolean }>(`/admin/inbound-packages/${id}/images?imageUrl=${encodeURIComponent(imageUrl)}&confirm=DELETE_HARD`, { method: 'DELETE' }),

  // === Customer Shipments ===
  listCustomerShipments: async (params?: { q?: string; status?: string; paymentStatus?: string; shipmentType?: string; customerId?: string; masterShipmentId?: string; unbatched?: boolean; page?: number; pageSize?: number }) => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const data = await adminApiFetch<PaginationLike<CustomerShipment>>(
      `/admin/customer-shipments${buildQuery(params || {})}`
    );
    return normalizePagination(data, page, pageSize);
  },

  getCustomerShipments: (params?: { q?: string; status?: string; paymentStatus?: string; shipmentType?: string; customerId?: string; masterShipmentId?: string; unbatched?: boolean; page?: number; pageSize?: number }) =>
    adminApi.listCustomerShipments(params),

  getCustomerShipmentById: (id: string) =>
    adminApiFetch<ItemLike<CustomerShipment>>(`/admin/customer-shipments/${id}`).then((res) => unwrapApiItem(res)),

  createCustomerShipment: (data: CreateCustomerShipmentPayload) =>
    adminApiFetch<ItemLike<CustomerShipment>>('/admin/customer-shipments', { method: 'POST', body: data }).then((res) => unwrapApiItem(res)),

  updateCustomerShipment: (id: string, data: UpdateCustomerShipmentPayload) =>
    adminApiFetch<ItemLike<CustomerShipment>>(`/admin/customer-shipments/${id}`, { method: 'PATCH', body: data }).then((res) => unwrapApiItem(res)),

  updateCustomerShipmentStatus: (id: string, data: { status: string }) =>
    adminApiFetch<ItemLike<CustomerShipment>>(`/admin/customer-shipments/${id}/status`, { method: 'PATCH', body: data }).then((res) => unwrapApiItem(res)),

  updateCustomerShipmentPaymentStatus: (id: string, data: { paymentStatus: string }) =>
    adminApiFetch<ItemLike<CustomerShipment>>(`/admin/customer-shipments/${id}/payment-status`, { method: 'PATCH', body: data }).then((res) => unwrapApiItem(res)),

  addItemToShipment: (id: string, data: { inboundPackageId: string }) =>
    adminApiFetch<unknown>(`/admin/customer-shipments/${id}/items`, { method: 'POST', body: data }),

  removeItemFromShipment: (shipmentId: string, itemId: string) =>
    adminApiFetch<unknown>(`/admin/customer-shipments/${shipmentId}/items/${itemId}`, { method: 'DELETE' }),

  // Customer Shipment images
  listCustomerShipmentImages: (id: string) =>
    adminApiFetch<string[]>(`/admin/customer-shipments/${id}/images`),

  uploadCustomerShipmentImage: (id: string, file: File) =>
    adminApiUpload<{ url: string }>(`/admin/customer-shipments/${id}/images`, file),

  deleteCustomerShipmentImage: (id: string, imageUrl: string) =>
    adminApiFetch<{ deleted: boolean }>(`/admin/customer-shipments/${id}/images?imageUrl=${encodeURIComponent(imageUrl)}&confirm=DELETE_HARD`, { method: 'DELETE' }),

  // === Master Shipments ===
  getMasterShipments: async (params?: { q?: string; status?: string; publicPublished?: boolean; publicVisible?: boolean; page?: number; pageSize?: number }) => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const data = await adminApiFetch<PaginationLike<MasterShipment>>(
      `/admin/master-shipments${buildQuery(params || {})}`
    );
    return normalizePagination(data, page, pageSize);
  },

  getMasterShipmentById: (id: string) =>
    adminApiFetch<ItemLike<MasterShipment>>(`/admin/master-shipments/${id}`).then((res) => unwrapApiItem(res)),

  createMasterShipment: (data: CreateMasterShipmentPayload) =>
    adminApiFetch<ItemLike<MasterShipment>>('/admin/master-shipments', { method: 'POST', body: data }).then((res) => unwrapApiItem(res)),

  updateMasterShipmentStatus: (id: string, data: { status: string }) =>
    adminApiFetch<ItemLike<MasterShipment>>(`/admin/master-shipments/${id}/status`, { method: 'PATCH', body: data }).then((res) => unwrapApiItem(res)),

  addCustomerShipmentsToMaster: (id: string, data: { customerShipmentIds: string[] }) =>
    adminApiFetch<unknown>(`/admin/master-shipments/${id}/customer-shipments`, { method: 'POST', body: data }),

  removeCustomerShipmentFromMaster: (masterId: string, csId: string) =>
    adminApiFetch<unknown>(`/admin/master-shipments/${masterId}/customer-shipments/${csId}`, { method: 'DELETE' }),

  updateMasterShipmentPublication: (id: string, data: { publicPublished: boolean }) =>
    adminApiFetch<ItemLike<MasterShipment>>(`/admin/master-shipments/${id}`, { method: 'PATCH', body: data }).then((res) => unwrapApiItem(res)),

  // === Transactions ===
  getTransactions: async (params?: { q?: string; customerId?: string; customerShipmentId?: string; page?: number; pageSize?: number }) => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const data = await adminApiFetch<PaginationLike<TransactionRecord>>(
      `/admin/transactions${buildQuery(params || {})}`
    );
    return normalizePagination(data, page, pageSize);
  },

  getTransactionById: (id: string) =>
    adminApiFetch<ItemLike<TransactionRecord>>(`/admin/transactions/${id}`).then((res) => unwrapApiItem(res)),

  createTransaction: (data: CreateTransactionPayload) =>
    adminApiFetch<ItemLike<TransactionRecord>>('/admin/transactions', { method: 'POST', body: data }).then((res) => unwrapApiItem(res)),

  updateTransaction: (id: string, data: UpdateTransactionPayload) =>
    adminApiFetch<ItemLike<TransactionRecord>>(`/admin/transactions/${id}`, { method: 'PATCH', body: data }).then((res) => unwrapApiItem(res)),

  // === Master Shipment extended ===
  updateMasterShipment: (id: string, data: { note: string | null }) =>
    adminApiFetch<ItemLike<MasterShipment>>(`/admin/master-shipments/${id}`, { method: 'PATCH', body: data }).then((res) => unwrapApiItem(res)),

  // === Hard Delete ===
  hardDeleteCustomer: (id: string) =>
    adminApiFetch<DeleteResponse>(`/admin/customers/${id}?confirm=DELETE_HARD`, { method: 'DELETE' }),

  hardDeleteInboundPackage: (id: string) =>
    adminApiFetch<DeleteResponse>(`/admin/inbound-packages/${id}?confirm=DELETE_HARD`, { method: 'DELETE' }),

  hardDeleteCustomerShipment: (id: string) =>
    adminApiFetch<DeleteResponse>(`/admin/customer-shipments/${id}?confirm=DELETE_HARD`, { method: 'DELETE' }),

  hardDeleteMasterShipment: (id: string) =>
    adminApiFetch<DeleteResponse>(`/admin/master-shipments/${id}?confirm=DELETE_HARD`, { method: 'DELETE' }),

  hardDeleteTransaction: (id: string) =>
    adminApiFetch<DeleteResponse>(`/admin/transactions/${id}?confirm=DELETE_HARD`, { method: 'DELETE' }),

  // === Customer Registrations ===
  getCustomerRegistrations: (params?: { q?: string; status?: string; page?: number; pageSize?: number }) =>
    adminApiFetch<PaginatedResponse<CustomerRegistration>>(
      `/admin/customer-registrations${buildQuery(params || {})}`
    ),

  getCustomerRegistrationById: async (id: string) =>
    unwrapApiItem(await adminApiFetch<ItemLike<CustomerRegistration>>(`/admin/customer-registrations/${id}`)),

  createCustomerRegistration: async (data: CreateCustomerRegistrationPayload) => {
    const res = await adminApiFetch<ItemLike<CustomerRegistration>>('/admin/customer-registrations', { method: 'POST', body: data });
    return unwrapApiItem(res);
  },

  updateCustomerRegistration: async (id: string, data: UpdateCustomerRegistrationPayload) => {
    const res = await adminApiFetch<ItemLike<CustomerRegistration>>(`/admin/customer-registrations/${id}`, { method: 'PATCH', body: data });
    return unwrapApiItem(res);
  },

  approveCustomerRegistration: async (id: string) => {
    const res = await adminApiFetch<ItemLike<ApproveCustomerRegistrationResponse>>(
      `/admin/customer-registrations/${id}/approve`,
      { method: 'POST' }
    );
    return unwrapApiItem(res);
  },

  hardDeleteCustomerRegistration: (id: string) =>
    adminApiFetch<DeleteResponse>(`/admin/customer-registrations/${id}?confirm=DELETE_HARD`, { method: 'DELETE' }),
};
