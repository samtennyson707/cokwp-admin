import { supabase, supabaseServiceRole } from '@/services/supabase'
import type { TQuizAttempt, QuizAttemptCreateInput, QuizAttemptCompleteInput, QuizSnapshot } from '@/types/quiz-attempt'
import { fetchQuizById } from './quizzes'
import { fetchQuestionsByQuizId } from './questions'
import { useProfileStore } from '@/store/profile-store'

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
  const { profile, isAdmin } = useProfileStore.getState();

  let query = supabase
    .from('quiz_attempts')
    .select('*')
    .order('started_at', { ascending: false })

  // 🔹 Apply filter only if user is NOT admin
  if (!isAdmin) {
    query = query.eq("user_id", profile?.id);
  }

  const { data, error } = await query;
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


/**
 * Deletes a quiz attempt and its related answers.
 * Uses service role to ensure cascading deletes when RLS is enabled.
 */
export async function deleteQuizAttempt(id: string): Promise<void> {
  // Delete child answers first to avoid FK constraint issues when cascade is not configured
  const { error: answersError } = await supabaseServiceRole
    .from('answers')
    .delete()
    .eq('attempt_id', id)
  if (answersError) {
    throw new Error(answersError.message)
  }
  const { error: attemptError } = await supabaseServiceRole
    .from('quiz_attempts')
    .delete()
    .eq('id', id)
  if (attemptError) {
    throw new Error(attemptError.message)
  }
}


