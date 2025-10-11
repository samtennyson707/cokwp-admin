export type TQuizAttempt = {
  id: string
  quiz_id: string
  user_id: string
  started_at?: string
  completed_at?: string | null
  score?: number | null
}

export type QuizAttemptCreateInput = {
  quiz_id: string
  user_id: string
}

export type QuizAttemptCompleteInput = {
  score: number
}


