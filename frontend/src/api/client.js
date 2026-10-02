import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT access token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('techprice_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const productApi = {
  getProducts: (params = {}) => api.get('/products', { params }),
  getProductDetail: (id) => api.get(`/products/${id}`),
  getPriceHistory: (id) => api.get(`/products/${id}/history`),
  getCategories: () => api.get('/categories'),
  getBrands: () => api.get('/brands'),
  getSuggestions: (q) => api.get('/search/suggestions', { params: { q } }),
}

export const compareApi = {
  compareProducts: (ids) => api.get('/compare', { params: { ids: ids.join(',') } }),
}

export const alertApi = {
  createAlert: (data) => api.post('/alerts', data),
  getAlerts: (email) => api.get('/alerts', { params: email ? { email } : {} }),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
  toggleAlert: (id) => api.patch(`/alerts/${id}/toggle`),
  getNotifications: () => api.get('/notifications'),
  markRead: (id) => api.post(`/notifications/${id}/read`),
  getEmailLogs: () => api.get('/emails/logs'),
  sendTestEmail: (data) => api.post('/alerts/email/send-test', data),
  getEmailPreviewUrl: (productId) => `/api/alerts/email/preview?product_id=${productId || 390}`,
}

export const scraperApi = {
  getStatuses: () => api.get('/scrapers/status'),
  runScraper: (data) => api.post('/scrapers/run', data),
  getLastJob: () => api.get('/scrapers/last-job'),
  getSchedulerStatus: () => api.get('/scrapers/scheduler'),
  triggerScheduler: () => api.post('/scrapers/scheduler/trigger'),
}

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getProducts: (params = {}) => api.get('/admin/products', { params }),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getUsers: () => api.get('/admin/users'),
  broadcastNotification: (data) => api.post('/admin/broadcast-notification', data),
  getStores: () => api.get('/admin/stores'),
  createStore: (data) => api.post('/admin/stores', data),
}

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

export const analyticsApi = {
  pingVisit: (data) => api.post('/analytics/visit', data),
  getStats: () => api.get('/analytics/stats'),
}

export default api

