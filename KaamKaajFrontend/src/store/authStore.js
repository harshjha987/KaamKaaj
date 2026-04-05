import { create } from 'zustand'
import { authService } from '../services/endpoints'

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('kk-user') || 'null'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await authService.login({ email, password })
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)

      // Fetch full profile
      const { data: profile } = await authService.me()
      localStorage.setItem('kk-user', JSON.stringify(profile))
      set({ user: profile, isAuthenticated: true, loading: false })
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials'
      set({ loading: false, error: msg })
      return { success: false, error: msg }
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null })
    try {
      await authService.register({ username, email, password })
      // Auto-login after register
      return await get().login(email, password)
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      set({ loading: false, error: msg })
      return { success: false, error: msg }
    }
  },

  logout: async () => {
    try { await authService.logout() } catch (_) {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('kk-user')
    set({ user: null, isAuthenticated: false, error: null })
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore
