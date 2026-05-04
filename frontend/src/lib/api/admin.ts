// Admin API client with JWT authentication
import { ApiResponse, PaginatedResponse } from './client';

// Get admin token from localStorage
function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

// Admin API fetch wrapper
export async function adminApiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAdminToken();

  if (!token) {
    throw new Error('未登录，请先登录');
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gjxpress.net';
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
    });

    // Handle 401 - token expired or invalid
    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
      throw new Error('登录已过期，请重新登录');
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.error?.message || `API Error: ${response.status}`;
      throw new Error(errorMessage);
    }

    if (!data || !data.success) {
      const errorMessage = data?.error?.message || '请求失败';
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('网络错误，请稍后重试');
  }
}

// Admin authentication
export const adminAuth = {
  login: async (username: string, password: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gjxpress.net';
    const response = await fetch(`${baseUrl}/auth/admin-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || '登录失败');
    }

    // Store token
    localStorage.setItem('admin_token', data.data.token);
    localStorage.setItem('admin_user', JSON.stringify(data.data.admin));

    return data.data;
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  },

  getUser: () => {
    if (typeof window === 'undefined') return null;
    const userJson = localStorage.getItem('admin_user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as AdminUser;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('admin_token');
  },
};

// Admin API endpoints
export const adminApi = {
  // Dashboard
  getDashboardSummary: () =>
    adminApiFetch<DashboardSummary>('/admin/dashboard/summary'),

  // Orders
  getOrders: (params?: OrderListParams) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.paymentStatus) searchParams.set('paymentStatus', params.paymentStatus);
    if (params?.userCode) searchParams.set('userCode', params.userCode);
    if (params?.orderNo) searchParams.set('orderNo', params.orderNo);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    const query = searchParams.toString();
    return adminApiFetch<PaginatedResponse<Order>>(`/admin/orders${query ? `?${query}` : ''}`);
  },

  getOrderById: (id: string) =>
    adminApiFetch<Order>(`/admin/orders/${id}`),

  createOrder: (data: CreateOrderRequest) =>
    adminApiFetch<Order>('/admin/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateOrderStatus: (id: string, data: UpdateOrderStatusRequest) =>
    adminApiFetch<Order>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updatePaymentStatus: (id: string, data: UpdatePaymentStatusRequest) =>
    adminApiFetch<Order>(`/admin/orders/${id}/payment-status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Packages
  inboundPackage: (data: InboundPackageRequest) =>
    adminApiFetch<{ package: Package; inboundRecord: InboundRecord }>('/admin/packages/inbound', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Exceptions
  getExceptions: (params?: ExceptionListParams) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.userCode) searchParams.set('userCode', params.userCode);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    const query = searchParams.toString();
    return adminApiFetch<PaginatedResponse<ExceptionCase>>(`/admin/exceptions${query ? `?${query}` : ''}`);
  },

  updateException: (id: string, data: UpdateExceptionRequest) =>
    adminApiFetch<ExceptionCase>(`/admin/exceptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Logs
  getActionLogs: (params?: LogListParams) => {
    const searchParams = new URLSearchParams();
    if (params?.adminId) searchParams.set('adminId', params.adminId);
    if (params?.targetType) searchParams.set('targetType', params.targetType);
    if (params?.targetId) searchParams.set('targetId', params.targetId);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    const query = searchParams.toString();
    return adminApiFetch<PaginatedResponse<ActionLog>>(`/admin/action-logs${query ? `?${query}` : ''}`);
  },
};

// Types
export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  role: string;
}

export interface DashboardSummary {
  todayInboundCount: number;
  pendingUserConfirmCount: number;
  pendingPaymentCount: number;
  readyToShipCount: number;
  shippedTodayCount: number;
  openExceptionCount: number;
}

export interface OrderListParams {
  status?: string;
  paymentStatus?: string;
  userCode?: string;
  orderNo?: string;
  page?: number;
  pageSize?: number;
}

export interface Order {
  id: string;
  orderNo: string;
  userId: string;
  user?: {
    id: string;
    userCode: string;
    nickname: string;
  };
  status: string;
  paymentStatus: string;
  packageCount: number;
  totalActualWeight: number;
  totalVolumeWeight: number;
  chargeableWeight: number;
  estimatedPrice: number;
  finalPrice: number;
  currency: string;
  manualOverride: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  userCode: string;
  remark?: string;
}

export interface UpdateOrderStatusRequest {
  status: string;
  override?: boolean;
  reason?: string;
}

export interface UpdatePaymentStatusRequest {
  paymentStatus: string;
  paymentMethod?: string;
  amount?: number;
  remark?: string;
  reason?: string;
}

export interface Package {
  id: string;
  packageNo: string;
  orderId: string;
  domesticTrackingNo: string;
  sourcePlatform: string;
  status: string;
  actualWeight: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  volumeWeight: number;
  inboundAt: string;
}

export interface InboundRecord {
  id: string;
  packageId: string;
  inboundTime: string;
  operatorAdminId: string;
  checkResult: string;
  remark: string;
}

export interface InboundPackageRequest {
  userCode: string;
  orderId?: string;
  domesticTrackingNo: string;
  sourcePlatform: string;
  actualWeight: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  remark?: string;
}

export interface ExceptionCase {
  id: string;
  type: string;
  status: string;
  description: string;
  orderNo: string;
  packageNo: string;
  userCode: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ExceptionListParams {
  status?: string;
  type?: string;
  userCode?: string;
  page?: number;
  pageSize?: number;
}

export interface UpdateExceptionRequest {
  status: string;
  resolutionNote?: string;
}

export interface ActionLog {
  id: string;
  adminId: string;
  adminName: string;
  targetType: string;
  targetId: string;
  action: string;
  beforeState: Record<string, unknown>;
  afterState: Record<string, unknown>;
  reason?: string;
  createdAt: string;
}

export interface LogListParams {
  adminId?: string;
  targetType?: string;
  targetId?: string;
  page?: number;
  pageSize?: number;
}
