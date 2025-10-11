import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { ProfileState, TProfile } from '@/types/profile'
import { supabase } from '@/services/supabase';

export const useProfileStore = create<ProfileState>()(
  devtools(
    persist(
      (set) => ({
        profile: null,
        setProfile: (profile: TProfile | null) =>
          set({ profile }, false, "setProfile"),
        fetchProfile: async (userId: string) => {
          const { data, error } = await supabase
            .from("profiles")
            .select()
            .eq("id", userId)
            .single();
          if (data) set({ profile: data }, false, "fetchProfile");
          if (error) console.error(error);
        },
      }),
      { name: "Profile store" }
    ),
  )
);
