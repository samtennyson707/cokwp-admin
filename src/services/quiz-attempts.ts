import { supabase } from '@/services/supabase'
import type { TQuizAttempt, QuizAttemptCreateInput, QuizAttemptCompleteInput, QuizSnapshot } from '@/types/quiz-attempt'
import { fetchQuizById } from './quizzes'
import { fetchQuestionsByQuizId } from './questions'

/**
 * Creates a new quiz attempt with a snapshot of the quiz and questions
 * The snapshot preserves the quiz state at the time of the attempt
 */
export async function createQuizAttempt(input: QuizAttemptCreateInput): Promise<TQuizAttempt> {
  const quiz = await fetchQuizById(input.quiz_id)
  const questions = await fetchQuestionsByQuizId(input.quiz_id)
  const snapshot: QuizSnapshot = {
    ...quiz,
    questions,
  }
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      ...input,
      started_at: new Date().toISOString(),
      snapshot_quiz: snapshot,
    })
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


