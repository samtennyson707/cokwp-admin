import type { TQuiz } from './quiz'
import type { TQuestion } from './question'

export type QuizSnapshot = TQuiz & {
  questions: TQuestion[]
}

export type TQuizAttempt = {
  id: string
  quiz_id: string
  user_id: string
  started_at?: string
  completed_at?: string | null
  score?: number | null
  snapshot_quiz?: QuizSnapshot | null
}

export type QuizAttemptCreateInput = {
  quiz_id: string
  user_id: string
}

export type QuizAttemptCompleteInput = {
  score: number
}


