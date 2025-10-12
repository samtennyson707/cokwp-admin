import { supabase } from '@/services/supabase'
import type { TAnswer } from '@/types/answer'

/**
 * Fetches all answers for a specific quiz attempt
 * Orders by created_at to preserve the order in which answers were submitted
 */
export async function fetchAnswersByAttemptId(attemptId: string): Promise<TAnswer[]> {
  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('attempt_id', attemptId)
    .order('created_at', { ascending: true })
  if (error) {
    throw new Error(error.message)
  }
  return data as TAnswer[]
}

/**
 * Creates a single answer record for a quiz attempt
 * Option A: Use this to save answers immediately as the user selects them
 */
export async function createAnswer(input: {
  attempt_id: string
  question_id: string
  selected_option: string
  correct_option: string
}): Promise<TAnswer> {
  const isCorrect = input.selected_option === input.correct_option
  const { data, error } = await supabase
    .from('answers')
    .insert({
      attempt_id: input.attempt_id,
      question_id: input.question_id,
      selected_option: input.selected_option,
      is_correct: isCorrect,
    })
    .select('*')
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data as TAnswer
}

/**
 * Creates multiple answer records in a single transaction
 * Option B: Use this to save all answers when the quiz is submitted
 */
export async function createAnswersBatch(inputs: Array<{
  attempt_id: string
  question_id: string
  selected_option: string
  correct_option: string
}>): Promise<TAnswer[]> {
  const records = inputs.map((input) => ({
    attempt_id: input.attempt_id,
    question_id: input.question_id,
    selected_option: input.selected_option,
    is_correct: input.selected_option === input.correct_option,
  }))
  const { data, error } = await supabase
    .from('answers')
    .insert(records)
    .select('*')
  if (error) {
    throw new Error(error.message)
  }
  return data as TAnswer[]
}

/**
 * Calculates the score for a quiz attempt based on correct answers
 * Returns the number of correct answers
 */
export async function calculateAttemptScore(attemptId: string): Promise<number> {
  const { data, error } = await supabase
    .from('answers')
    .select('is_correct')
    .eq('attempt_id', attemptId)
  if (error) {
    throw new Error(error.message)
  }
  const score = data.filter((answer) => answer.is_correct).length
  return score
}


