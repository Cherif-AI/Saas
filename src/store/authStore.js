import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      accessToken:  null,
      refreshToken: null,
      user:         null,

      setAuth: (data) => set({
        accessToken:  data.accessToken,
        refreshToken: data.refreshToken,
        user:         data.user,
      }),

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      logout: () => set({ accessToken: null, refreshToken: null, user: null }),

      isAuthenticated: () => !!useAuthStore.getState().accessToken,
    }),
    {
      name: 'dimba-auth',
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        user: s.user,
      }),
    }
  )
)
