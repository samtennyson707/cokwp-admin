import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { TQuiz } from '@/types/quiz'
import type { TQuestion } from '@/types/question'
import { fetchQuizById, toggleQuizStatus } from '@/services/quizzes'
import { fetchQuestionsByQuizId } from '@/services/questions'
import { supabase } from '@/services/supabase'
import { showErrorToast, showSuccessToast } from '@/lib/toast-util'
import AddQuestionModal from '@/components/questions/modals/add-question'
import QuestionList from '@/components/questions/question-list'
import { useProfileStore } from '@/store/profile-store'
import { Switch } from '@/components/ui/switch'

export default function QuizDetail() {
  const params = useParams()
  const quizId = useMemo(() => params.id ?? '', [params])
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState<TQuiz | null>(null)
  const [questions, setQuestions] = useState<TQuestion[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const isAdmin = useProfileStore(state => state.isAdmin)
  const [isToggling, setIsToggling] = useState<Record<string, boolean>>({})
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

  async function handleToggleStatus(quiz: TQuiz) {
    if (!quiz) return
    if (isToggling[quiz.id]) return
    try {
      setIsToggling((prev) => ({ ...prev, [quiz.id]: true }))
      const updated = await toggleQuizStatus(quiz.id, !quiz.is_active)
      setQuiz(updated)
      showSuccessToast(`Quiz ${updated.is_active ? 'activated' : 'deactivated'} successfully`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update quiz status'
      showErrorToast(message)
    } finally {
      setIsToggling((prev) => ({ ...prev, [quiz.id]: false }))
    }
  }

  if (!quizId) return <div className="w-full">Missing quiz identifier.</div>

  function renderNoQuestionsContent() {
    if (questions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">No questions found</p>
          <AddQuestionModal preferQuizId={quizId} onCreated={handleQuestionCreated} />
        </div>
      )
    } else {
      return (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Questions {questions.length > 0 && <span className="text-sm text-muted-foreground">({questions.length})</span>}</h2>
          <AddQuestionModal preferQuizId={quizId} onCreated={handleQuestionCreated} />
        </div>
      )
    }
  }

  function renderStatusContent() {
    console.log(questions.length)
    if (!quiz) return
    if (questions.length < 5) {
      return (
        <div className="text-lg font-medium text-yellow-500">Quiz must have at least 5 questions to be active</div>
      )
    }
    return (
      <>
        <div className="text-sm font-medium">{quiz?.is_active ? 'Active' : 'Inactive'} {questions.length > 5 ? ' (Quiz must have at least 5 questions to be active)' : ''}</div>
        {isAdmin && <Switch
          checked={quiz?.is_active}
          onCheckedChange={() => handleToggleStatus(quiz)}
          disabled={isToggling[quiz?.id ?? '']}
        />}
      </>
    )
  }

  function renderQuestionsContent() {
    if (isAdmin) {
      return (
        <>
          <div className="md:col-span-2 space-y-4">
            {renderNoQuestionsContent()}
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              <QuestionList questions={questions} onUpdated={handleQuestionUpdated} onDeleted={handleQuestionDeleted} />
            )}
          </div>
        </>
      )
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
          Back
        </button>
        <h1 className="text-2xl font-semibold tracking-tight">{quiz?.title ?? 'Quiz'}</h1>
        <p className="text-sm text-muted-foreground">{quiz?.description ?? 'No description'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderQuestionsContent()}
        <aside className="space-y-3">
          <div className="rounded-md border p-4">
            <div className="text-sm text-muted-foreground">Status</div>
            {renderStatusContent()}
          </div>
          {!isAdmin && <div className="rounded-md border p-4">
            <div className="text-sm text-muted-foreground">Actions</div>
            <div className="mt-2">
              <button
                type="button"
                className="inline-flex items-center justify-center h-9 rounded-md border px-3 text-sm"
                onClick={() => navigate(`/quizzes/${quizId}/attempt`)}
              >
                Attempt Quiz
              </button>
            </div>
          </div>
          }
          <div className="rounded-md border p-4">
            <div className="text-sm text-muted-foreground">Created By</div>
            <div className="text-sm font-medium">{quiz?.created_by?.first_name + ' ' + quiz?.created_by?.last_name}</div>
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


