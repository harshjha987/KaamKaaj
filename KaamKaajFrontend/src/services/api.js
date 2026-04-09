import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

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
      original.url?.includes('/auth/refresh')  ||
      original.url?.includes('/auth/me')       // ← important: don't retry /me

    if (error.response?.status === 401 &&
        !original._retry &&
        !isAuthEndpoint) {

      // Only attempt refresh if the user was actually authenticated.
      // Check this by looking at the Zustand store's isAuthenticated flag.
      // If they were never logged in (landing page visitor), skip silently.
      const { default: useAuthStore } = await import('../store/authStore')
      const isAuthenticated = useAuthStore.getState().isAuthenticated

      if (!isAuthenticated) {
        // Not logged in — just reject silently, no toast, no redirect
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(original))
          .catch((err) => Promise.reject(err))
      }

      original._retry = true
      isRefreshing    = true

      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL || '/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        processQueue(null)
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError)

        // Only show session expired toast if they were actually logged in
        const { default: useToastStore } = await import('../store/toastStore')
        useToastStore.getState().addToast(
          'Your session has expired. Please log in again.',
          'error'
        )

        // Clear auth state
        useAuthStore.getState().logout()

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