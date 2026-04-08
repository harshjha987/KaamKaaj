import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  // Send cookies with every request — this is what makes HttpOnly cookies work
  withCredentials: true,
})

// No request interceptor needed — browser sends cookies automatically

// Response interceptor — silent token refresh on 401
let isRefreshing = false
let failedQueue  = []

const processQueue = (error) => {
  failedQueue.forEach((p) => error ? p.reject(error) : p.resolve())
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    const isAuthEndpoint =
      original.url?.includes('/auth/login')    ||
      original.url?.includes('/auth/register') ||
      original.url?.includes('/auth/refresh')

    if (error.response?.status === 401 &&
        !original._retry &&
        !isAuthEndpoint) {

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(original))
          .catch((err) => Promise.reject(err))
      }

      original._retry = true
      isRefreshing    = true

      try {
        // Backend reads refreshToken cookie and sets new accessToken cookie
        await axios.post(
          `${import.meta.env.VITE_API_URL || '/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        processQueue(null)
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError)

        // Show toast before redirecting
        const { default: useToastStore } = await import('../store/toastStore')
        useToastStore.getState().addToast(
          'Your session has expired. Please log in again.',
          'error'
        )
        setTimeout(() => { window.location.href = '/auth' }, 1500)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api