import { supabase } from '@/services/supabase'
import type { TProfile } from '@/types/profile'

export async function fetchProfilesByIds(ids: readonly string[]): Promise<TProfile[]> {
  if (ids.length === 0) return []
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', ids as string[])
  if (error) {
    throw new Error(error.message)
  }
  return data as TProfile[]
}

export async function fetchProfileById(id: string): Promise<TProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data as TProfile
}

export async function updateProfile(id: string, updates: Partial<TProfile>): Promise<TProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data as TProfile
}

export async function deleteProfile(id: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
}

