'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  email: string | null
  isAuthenticated: boolean
  isDemo: boolean
  isAdmin: boolean
  setAuth: (
    token: string,
    email: string,
    isDemo?: boolean,
    isAdmin?: boolean
  ) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => {
      return {
        token: null,
        email: null,
        isAuthenticated: false,
        isDemo: false,
        isAdmin: false,
        setAuth: (token, email, isDemo = false, isAdmin = false) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token)
          }
          set({ token, email, isAuthenticated: true, isDemo, isAdmin })
        },
        clearAuth: () => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
          }
          set({
            token: null,
            email: null,
            isAuthenticated: false,
            isDemo: false,
            isAdmin: false,
          })
        },
      }
    },
    {
      name: 'auth-storage',
    }
  )
)
