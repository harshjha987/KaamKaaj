import { create } from 'zustand'
import { authService } from '../services/endpoints'

const useAuthStore = create((set, get) => ({
  // No tokens in state — they live in HttpOnly cookies
  // User info kept in memory only — re-fetched on app start
  user:            null,
  isAuthenticated: false,
  loading:         false,
  error:           null,

  // Called once on app start in main.jsx
  // Hits /auth/me — if the cookie is valid, returns user info
  // If not, user is not authenticated
  checkAuth: async () => {
    try {
      const { data } = await authService.me()
      set({ user: data, isAuthenticated: true })
    } catch {
      set({ user: null, isAuthenticated: false })
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      // Backend sets HttpOnly accessToken + refreshToken cookies
      // Response body only contains user info
      const { data } = await authService.login({ email, password })
      set({ user: data, isAuthenticated: true, loading: false })
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message
                || err.response?.data?.error
                || 'Invalid credentials'
      set({ loading: false, error: msg })
      return { success: false, error: msg }
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null })
    try {
      await authService.register({ username, email, password })
      // Auto-login after registration
      return await get().login(email, password)
    } catch (err) {
      const msg = err.response?.data?.message
                || err.response?.data?.error
                || 'Registration failed'
      set({ loading: false, error: msg })
      return { success: false, error: msg }
    }
  },

  logout: async () => {
    try {
      // Backend clears cookies and revokes refresh tokens
      await authService.logout()
    } catch (_) {}
    set({ user: null, isAuthenticated: false, error: null })
  },

  // Update local user info after settings change (username update etc)
  setUser: (user) => set({ user }),

  clearError: () => set({ error: null }),
}))

export default useAuthStore