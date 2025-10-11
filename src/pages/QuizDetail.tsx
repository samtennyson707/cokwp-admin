import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { TQuiz } from '@/types/quiz'
import type { TQuestion } from '@/types/question'
import { fetchQuizById } from '@/services/quizzes'
import { fetchQuestionsByQuizId } from '@/services/questions'
import { supabase } from '@/services/supabase'
import { showErrorToast } from '@/lib/toast-util'
import AddQuestionModal from '@/components/questions/modals/add-question'
import QuestionList from '@/components/questions/question-list'

export default function QuizDetail() {
  const params = useParams()
  const quizId = useMemo(() => params.id ?? '', [params])
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState<TQuiz | null>(null)
  const [questions, setQuestions] = useState<TQuestion[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!quizId) return
    async function loadData() {
      try {
        setIsLoading(true)
        const [quizData, questionsData] = await Promise.all([
          fetchQuizById(quizId),
          fetchQuestionsByQuizId(quizId),
        ])
        setQuiz(quizData)
        setQuestions(questionsData)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load quiz'
        showErrorToast(message)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [quizId])

  useEffect(() => {
    if (!quizId) return
    const channel = supabase
      .channel(`quiz-detail-${quizId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'quizzes', filter: `id=eq.${quizId}` }, (payload) => {
        setQuiz(payload.new as TQuiz)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions', filter: `quiz_id=eq.${quizId}` }, (payload) => {
        setQuestions((prev) => {
          if (payload.eventType === 'INSERT') return [payload.new as TQuestion, ...prev]
          if (payload.eventType === 'UPDATE') return prev.map((q) => (q.id === (payload.new as TQuestion).id ? (payload.new as TQuestion) : q))
          if (payload.eventType === 'DELETE') return prev.filter((q) => q.id !== (payload.old as TQuestion).id)
          return prev
        })
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [quizId])

  function handleQuestionCreated(created: TQuestion) {
    setQuestions((prev) => [created, ...prev])
  }

  function handleQuestionUpdated(updated: TQuestion) {
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
  }

  function handleQuestionDeleted(removed: TQuestion) {
    setQuestions((prev) => prev.filter((q) => q.id !== removed.id))
  }

  if (!quizId) return <div className="w-full">Missing quiz identifier.</div>

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
        <h1 className="text-2xl font-semibold tracking-tight">{quiz?.title ?? 'Quiz'}</h1>
        <p className="text-sm text-muted-foreground">{quiz?.description ?? 'No description'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Questions {questions.length > 0 && <span className="text-sm text-muted-foreground">({questions.length})</span>}</h2>
            <AddQuestionModal preferQuizId={quizId} onCreated={handleQuestionCreated} />
          </div>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <QuestionList questions={questions} onUpdated={handleQuestionUpdated} onDeleted={handleQuestionDeleted} />
          )}
        </div>
        <aside className="space-y-3">
          <div className="rounded-md border p-4">
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="text-sm font-medium">{quiz?.is_active ? 'Active' : 'Inactive'}</div>
          </div>
          <div className="rounded-md border p-4">
            <div className="text-sm text-muted-foreground">Created By</div>
            <div className="text-sm font-medium">{quiz?.created_by ?? '-'}</div>
          </div>
          <div className="rounded-md border p-4">
            <div className="text-sm text-muted-foreground">Created At</div>
            <div className="text-sm font-medium">{quiz?.created_at ? new Date(quiz.created_at).toLocaleString() : '-'}</div>
          </div>
        </aside>
      </div>
    </div>
  )
}


