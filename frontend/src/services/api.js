import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = useAuthStore.getState().refreshToken
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken })
          const { accessToken, user } = res.data
          useAuthStore.getState().setAuth(user, accessToken, refreshToken)
          original.headers.Authorization = `Bearer ${accessToken}`
          return api(original)
        } catch {
          useAuthStore.getState().logout()
          window.location.href = '/login'
        }
      } else {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

// Room APIs
export const roomApi = {
  getPublic: () => api.get('/rooms/public'),
  getMy: () => api.get('/rooms/my'),
  create: (data) => api.post('/rooms', data),
  join: (id) => api.post(`/rooms/${id}/join`),
  leave: (id) => api.post(`/rooms/${id}/leave`),
  getMessages: (id, page = 0) => api.get(`/rooms/${id}/messages?page=${page}&size=50`),
  sendMessage: (id, data) => api.post(`/rooms/${id}/messages`, data),
  getDirect: (targetUserId) => api.post(`/rooms/direct/${targetUserId}`),
}

// User APIs
export const userApi = {
  getAll: () => api.get('/users'),
  search: (query) => api.get(`/users/search?query=${encodeURIComponent(query)}`),
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (data) => api.put('/users/profile', data),
}

export default api
