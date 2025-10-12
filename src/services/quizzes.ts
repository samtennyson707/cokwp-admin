import { supabase } from '@/services/supabase'
import type { TQuiz, QuizCreateInput, QuizUpdateInput } from '@/types/quiz'
import { useProfileStore } from '@/store/profile-store'

export async function fetchQuizzes(): Promise<TQuiz[]> {
  const { profile } = useProfileStore.getState();

  if (!profile) {
    console.log("No profile found");
    return []
  }

  let query = supabase
    .from("quizzes")
    .select(`
      *,
      created_by:profiles (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .order("created_at", { ascending: false })
    
  // 🔹 Apply filter only if user is NOT admin
  if (!profile.isAdmin) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data as TQuiz[];
}


export async function fetchQuizById(id: string): Promise<TQuiz> {
  const { data, error } = await supabase
    .from('quizzes')
    .select(`*, created_by:profiles (
      id,
      first_name,
      last_name,
      email
    )`)
    .eq('id', id)
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data as TQuiz
}

export async function fetchQuizzesByIds(ids: readonly string[]): Promise<TQuiz[]> {
  if (ids.length === 0) return []
  const { data, error } = await supabase
    .from('quizzes')
    .select(`*, created_by:profiles (
      id,
      first_name,
      last_name,
      email
    )`)
    .in('id', ids as string[])
  if (error) {
    throw new Error(error.message)
  }
  return data as TQuiz[]
}

export async function createQuiz(input: QuizCreateInput, userId: string): Promise<TQuiz> {
  const payload = { ...input, is_active: input.is_active ?? true, created_by: userId }
  const { data, error } = await supabase
    .from('quizzes')
    .insert(payload)
    .select(`*, created_by:profiles (
      id,
      first_name,
      last_name,
      email
    )`)
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data as TQuiz
}

export async function updateQuiz(id: string, input: QuizUpdateInput): Promise<TQuiz> {
  const { data, error } = await supabase
    .from('quizzes')
    .update(input)
    .eq('id', id)
    .select(`*, created_by:profiles (
      id,
      first_name,
      last_name,
      email
    )`)
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data as TQuiz
}

export async function deleteQuiz(id: string): Promise<void> {
  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
}

export async function toggleQuizStatus(id: string, isActive: boolean): Promise<TQuiz> {
  const { data, error } = await supabase
    .from('quizzes')
    .update({ is_active: isActive })
    .eq('id', id)
    .select(`*, created_by:profiles (
      id,
      first_name,
      last_name,
      email
    )`)
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data as TQuiz
}


