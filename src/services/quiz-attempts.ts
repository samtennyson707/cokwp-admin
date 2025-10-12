import { supabase } from '@/services/supabase'
import type { TQuizAttempt, QuizAttemptCreateInput, QuizAttemptCompleteInput } from '@/types/quiz-attempt'

export async function createQuizAttempt(input: QuizAttemptCreateInput): Promise<TQuizAttempt> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({ ...input })
    .select('*')
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data as TQuizAttempt
}

export async function completeQuizAttempt(id: string, input: QuizAttemptCompleteInput): Promise<TQuizAttempt> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .update({ score: input.score, completed_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data as TQuizAttempt
}

export async function fetchQuizAttempts(): Promise<TQuizAttempt[]> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .order('started_at', { ascending: false })
  if (error) {
    throw new Error(error.message)
  }
  return data as TQuizAttempt[]
}

export async function fetchQuizAttemptById(id: string): Promise<TQuizAttempt> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data as TQuizAttempt
}


