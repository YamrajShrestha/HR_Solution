import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axios.post(`${API_URL}/auth/login`, credentials)
          const { user, token } = response.data
          
          // Set token in axios defaults
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          })
          
          return { success: true }
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.message || 'Login failed' 
          })
          return { success: false, error: error.response?.data?.message }
        }
      },

      logout: () => {
        delete axios.defaults.headers.common['Authorization']
        set({ user: null, isAuthenticated: false })
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)

// Auto-login on app start
const token = localStorage.getItem('auth-storage')
if (token) {
  const parsed = JSON.parse(token)
  if (parsed.user) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`
  }
}