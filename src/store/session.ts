import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SessionState {
  user: any
  isAuthenticated: boolean
  setUser: (user: any) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearSession: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'user-session',
    }
  )
)