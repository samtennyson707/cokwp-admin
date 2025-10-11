import { supabase } from '@/services/supabase'
import type { TQuiz, QuizCreateInput, QuizUpdateInput } from '@/types/quiz'

export async function fetchQuizzes(): Promise<TQuiz[]> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false })
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
    .select('*')
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
    .select('*')
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


