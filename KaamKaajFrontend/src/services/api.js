import axios from 'axios'

// ── BASE INSTANCE ──────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// ── REQUEST INTERCEPTOR ────────────────────────────────────────────────────────
// Attaches the access token to every request automatically.
// The client never needs to manually add Authorization headers.
// In your existing response interceptor — find the 401 handling part
// and replace with this:

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // If 401 and we haven't already retried
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api/v1'}/auth/refresh`,
          { refreshToken }
        )

        // Store new tokens
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)

        // Retry original request with new token
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)

      } catch (refreshError) {
        // Refresh failed — session truly expired
        // Clear all stored tokens
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')

        // Show toast before redirecting
        // We import the store directly to avoid circular deps
        const { useToastStore } = await import('../store/toastStore')
        useToastStore.getState().addToast(
          'Your session has expired. Please log in again.',
          'error'
        )

        // Small delay so toast is visible before redirect
        setTimeout(() => {
          window.location.href = '/auth'
        }, 1500)

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// ── RESPONSE INTERCEPTOR ───────────────────────────────────────────────────────
// When a 401 is received, attempt a silent token refresh using
// the refresh token. If refresh succeeds, retry the original request.
// If refresh fails, clear storage and redirect to login.
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Skip refresh for auth endpoints themselves
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh')

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        isRefreshing = false
        clearAuthStorage()
        window.location.href = '/auth'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken })
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`
        processQueue(null, data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAuthStorage()
        window.location.href = '/auth'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

function clearAuthStorage() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('kk-user')
}

export default api
