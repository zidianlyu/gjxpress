import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authApi = {
  login: (code: string, nickname?: string, avatar?: string) =>
    apiClient.post('/auth/login', { code, nickname, avatar }),
}

// Order APIs
export const orderApi = {
  getOrders: () => apiClient.get('/orders'),
  getOrder: (id: string) => apiClient.get(`/orders/${id}`),
  updatePayment: (id: string, status: string, finalPrice?: number, manualOverride?: boolean) =>
    apiClient.patch(`/orders/${id}/payment`, { status, final_price: finalPrice, manual_override: manualOverride }),
}

// Package APIs
export const packageApi = {
  inbound: (data: {
    user_id: string
    domestic_tracking_no: string
    source_platform?: string
    actual_weight: number
    length: number
    width: number
    height: number
    notes?: string
    goods_items?: { name: string; quantity: number; unit_value?: number }[]
  }) => apiClient.post('/packages/inbound', data),
  getPackage: (id: string) => apiClient.get(`/packages/${id}`),
  uploadImages: (packageId: string, images: { type: string; url: string }[]) =>
    apiClient.post(`/packages/${packageId}/images`, { images }),
}

// Shipment APIs
export const shipmentApi = {
  create: (orderId: string, data: { provider: string; tracking_number: string; estimated_arrival?: string }) =>
    apiClient.post('/shipments', { orderId, ...data }),
  getByOrder: (orderId: string) => apiClient.get(`/shipments/${orderId}`),
}

// Admin Log APIs
export const adminLogApi = {
  getLogs: (orderId?: string) => apiClient.get('/admin-logs', { params: { orderId } }),
}
