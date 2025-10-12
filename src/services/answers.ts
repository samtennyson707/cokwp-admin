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


