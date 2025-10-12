import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { TQuiz } from '@/types/quiz'
import type { TQuestion } from '@/types/question'
import type { TQuizAttempt } from '@/types/quiz-attempt'
import { fetchQuizById } from '@/services/quizzes'
import { fetchQuestionsByQuizId } from '@/services/questions'
import { createQuizAttempt, completeQuizAttempt } from '@/services/quiz-attempts'
import { createAnswersBatch, calculateAttemptScore } from '@/services/answers'
import { showErrorToast, showSuccessToast } from '@/lib/toast-util'
import { useProfileStore } from '@/store/profile-store'
import { Button } from '@/components/ui/button'

type AnswerMap = Record<string, string>

export default function QuizAttempt() {
  const params = useParams()
  const navigate = useNavigate()
  const quizId = useMemo(() => params.id ?? '', [params])
  const { profile } = useProfileStore()
  const [quiz, setQuiz] = useState<TQuiz | null>(null)
  const [questions, setQuestions] = useState<TQuestion[]>([])
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [attempt, setAttempt] = useState<TQuizAttempt | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!quizId) return
    async function load() {
      try {
        setIsLoading(true)
        const [qz, qs] = await Promise.all([
          fetchQuizById(quizId),
          fetchQuestionsByQuizId(quizId),
        ])
        setQuiz(qz)
        setQuestions(qs)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load quiz'
        showErrorToast(msg)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [quizId])

  async function handleStartAttempt() {
    if (!profile?.id || !quizId) {
      showErrorToast('Missing user or quiz context')
      return
    }
    try {
      const created = await createQuizAttempt({
        quiz_id: quizId,
        user_id: profile.id,
      })
      setAttempt(created)
      showSuccessToast('Quiz started! Good luck!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start quiz attempt'
      showErrorToast(msg)
    }
  }

  function handlePickAnswer(questionId: string, option: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
    // Option A - Real-time saving (uncomment to enable):
    // if (attempt) {
    //   const question = questions.find(q => q.id === questionId)
    //   if (question) {
    //     createAnswer({
    //       attempt_id: attempt.id,
    //       question_id: questionId,
    //       selected_option: option,
    //       correct_option: question.correct_answer,
    //     }).catch(err => {
    //       showErrorToast('Failed to save answer')
    //     })
    //   }
    // }
  }

  async function handleSubmitAttempt() {
    if (!attempt) {
      showErrorToast('Please start the quiz first')
      return
    }
    if (Object.keys(answers).length === 0) {
      showErrorToast('Please answer at least one question')
      return
    }
    try {
      setIsSubmitting(true)
      const answerInputs = Object.entries(answers).map(([questionId, selectedOption]) => {
        const question = questions.find((q) => q.id === questionId)
        if (!question) {
          throw new Error(`Question not found: ${questionId}`)
        }
        return {
          attempt_id: attempt.id,
          question_id: questionId,
          selected_option: selectedOption,
          correct_option: question.correct_answer,
        }
      })
      await createAnswersBatch(answerInputs)
      const score = await calculateAttemptScore(attempt.id)
      const updated = await completeQuizAttempt(attempt.id, { score })
      setAttempt(updated)
      showSuccessToast(`Quiz submitted successfully! Score: ${score}/${questions.length}`)
      navigate(`/quizzes/${quizId}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit quiz attempt'
      showErrorToast(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Back
        </button>
        <h1 className="text-2xl font-semibold tracking-tight">{quiz?.title ?? 'Quiz Attempt'}</h1>
        <p className="text-sm text-muted-foreground">{quiz?.description ?? ''}</p>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleStartAttempt} disabled={!!attempt}>Start Attempt</Button>
        {attempt && <span className="text-sm text-muted-foreground">Attempt ID: {attempt.id}</span>}
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, qi) => (
            <div key={q.id} className="rounded-md border p-3">
              <div className="mb-2 font-medium">{qi + 1}. {q.question_text}</div>
              <div className="space-y-2">
                {q.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx)
                  const picked = answers[q.id] === opt
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePickAnswer(q.id, opt)}
                      className={
                        `w-full text-left flex items-center gap-3 rounded-md border p-2 transition-colors ` +
                        (picked ? 'border-primary bg-primary/10' : 'hover:bg-muted')
                      }
                      disabled={!attempt}
                    >
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold">{letter}</span>
                      <span>{opt}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={handleSubmitAttempt} disabled={!attempt || isSubmitting}>Submit</Button>
        {attempt && (
          <span className="text-sm text-muted-foreground">Selected: {Object.keys(answers).length}/{questions.length}</span>
        )}
      </div>
    </div>
  )
}


