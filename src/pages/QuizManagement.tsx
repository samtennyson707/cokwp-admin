import { useEffect, useState } from 'react'
import type { TQuiz } from '@/types/quiz'
import { fetchQuizzes } from '@/services/quizzes'
import QuizList from '@/components/quizzes/quiz-list'
import { showErrorToast } from '@/lib/toast-util'
import { supabase } from '@/services/supabase'
import { useProfileStore } from '@/store/profile-store'
import AddQuizModal from '@/components/modal/add-quiz'

export default function QuizManagement() {
  useProfileStore()
  const [quizzes, setQuizzes] = useState<TQuiz[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function loadQuizzes() {
    try {
      setIsLoading(true)
      const data = await fetchQuizzes()
      setQuizzes(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load quizzes'
      showErrorToast(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadQuizzes()
    const channel = supabase
      .channel('quizzes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quizzes' }, (payload) => {
        setQuizzes((prev) => {
          if (payload.eventType === 'INSERT') {
            return [payload.new as TQuiz, ...prev]
          }
          if (payload.eventType === 'UPDATE') {
            return prev.map((q) => (q.id === (payload.new as TQuiz).id ? (payload.new as TQuiz) : q))
          }
          if (payload.eventType === 'DELETE') {
            return prev.filter((q) => q.id !== (payload.old as TQuiz).id)
          }
          return prev
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  function handleCreated(created: TQuiz) {
    setQuizzes((prev) => [created, ...prev])
  }

  function handleUpdated(updated: TQuiz) {
    setQuizzes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
  }

  function handleDeleted(removed: TQuiz) {
    setQuizzes((prev) => prev.filter((q) => q.id !== removed.id))
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Quizzes</h1>
      </div>
      <div className="max-w-md">
        <AddQuizModal onCreated={handleCreated} />
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <QuizList quizzes={quizzes} onUpdated={handleUpdated} onDeleted={handleDeleted} />
      )}
    </div>
  )
}