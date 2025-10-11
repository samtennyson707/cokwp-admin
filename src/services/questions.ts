import { supabase } from '@/services/supabase'
import type { TQuestion, QuestionCreateInput, QuestionUpdateInput } from '@/types/question'

export async function fetchQuestions(): Promise<TQuestion[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    throw new Error(error.message)
  }
  return data as TQuestion[]
}

export async function fetchQuestionsByQuizId(quizId: string): Promise<TQuestion[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('created_at', { ascending: false })
  if (error) {
    throw new Error(error.message)
  }
  return data as TQuestion[]
}

export async function createQuestion(input: QuestionCreateInput): Promise<TQuestion> {
  const { data, error } = await supabase
    .from('questions')
    .insert(input)
    .select('*')
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data as TQuestion
}

export async function updateQuestion(id: string, input: QuestionUpdateInput): Promise<TQuestion> {
  const { data, error } = await supabase
    .from('questions')
    .update(input)
    .eq('id', id)
    .select('*')
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data as TQuestion
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
}


