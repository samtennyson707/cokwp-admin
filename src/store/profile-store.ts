import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { ProfileState } from '@/types/profile'
import { supabase } from '@/services/supabase';

export const useProfileStore = create<ProfileState>()(
  devtools(
    persist(
      (set) => ({
        profile: null,
        setProfile: (profile: any) => set((state) => ({ ...state, profile })),
        fetchProfile: async (user: any) => {
          const { data, error } = await supabase.from("profiles").select().eq("id", user.id).single();
          if (data) {
            set((state) => ({ ...state, profile: data }))
          }
          if (error) {
            console.error('Error fetching profile:', error)
            throw new Error(error.message)
          }
        },
      }
      ),
      {
        name: 'user-profile',
      }
    )
  )
)