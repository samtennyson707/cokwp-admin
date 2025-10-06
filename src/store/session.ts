import { supabase } from '@/services/supabase'
import type { SessionState } from '@/types/session'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user: any) => set((state) => ({ ...state, user, isAuthenticated: !!user })),
      clearSession: () => set((state) => ({ ...state, user: null, isAuthenticated: false })),
      handleSignIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (data) {
          set((state) => ({ ...state, user: data.user, isAuthenticated: true }))
        }
        if (error) {
          console.error('Error logging in:', error)
        }
      },
      handleSignOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.error('Error logging out:', error)
        }
        set((state) => ({ ...state, user: null, isAuthenticated: false }))
      },
      handleAdminRegistration: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (!data.user) {
          console.error('Error registering:', error)
          return
        }

        await supabase.from("profiles").insert({
          id: data.user.id,
          role: "user",
        });
        if (error) {
          console.error('Error registering:', error)
        }
        set((state) => ({ ...state, user: data.user, isAuthenticated: true }))
      },
    }),
    {
      name: 'user-session',
    }
  )
)