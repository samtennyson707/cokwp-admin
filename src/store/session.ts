import { supabase } from '@/services/supabase'
import type { SessionState } from '@/types/session'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export const useSessionStore = create<SessionState>()(
  devtools(
    persist(
      (set) => ({
        userSession: null,
        isAuthenticated: false,
        setSession: (session: any) => set(() => ({ userSession: session, isAuthenticated: !!session })),
        clearSession: () => set(() => ({ userSession: null, isAuthenticated: false })),
        handleSignIn: async (email: string, password: string) => {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (data) {
            console.log(data, "data")
            set(() => ({ userSession: data.user, isAuthenticated: true }))
          }
          if (error) {
            console.error('Error logging in:', error)
            throw new Error(error.message)
          }
        },
        handleSignOut: async () => {
          console.log('Signing out...')
          const { error } = await supabase.auth.signOut()
          if (error) {
            console.error('Error logging out:', error)
            throw new Error(error.message)
          }
          set(() => ({ userSession: null, isAuthenticated: false }))
        },
        handleAdminRegistration: async (email: string, password: string) => {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                // role: 'admin',
                // full_name: email.split('@')[0],
                first_name: email.split('@')[0] + '_first',
                last_name: email.split('@')[0] + '_last',
                avatar_url: 'https://example.com/avatar.jpg',
              },
            },
          })
          if (error) {
            throw new Error(error.message)
          }
          set(() => ({ userSession: data.user, isAuthenticated: true }))
        },
      }),
      {
        name: 'user-session',
      }
    ),
  )

)