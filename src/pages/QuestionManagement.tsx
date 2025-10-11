import { useEffect, useState } from 'react'
import type { TQuestion } from '@/types/question'
import { fetchQuestions } from '@/services/questions'
import QuestionList from '@/components/questions/question-list'
import { showErrorToast } from '@/lib/toast-util'
import { supabase } from '@/services/supabase'
import AddQuestionModal from '@/components/questions/modals/add-question'

export default function QuestionManagement() {
  const [questions, setQuestions] = useState<TQuestion[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    async function loadQuestions() {
      try {
        setIsLoading(true)
        const data = await fetchQuestions()
        setQuestions(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load questions'
        showErrorToast(message)
      } finally {
        setIsLoading(false)
      }
    }
    loadQuestions()
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('questions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, (payload) => {
        setQuestions((prev) => {
          if (payload.eventType === 'INSERT') {
            return [payload.new as TQuestion, ...prev]
          }
          if (payload.eventType === 'UPDATE') {
            return prev.map((q) => (q.id === (payload.new as TQuestion).id ? (payload.new as TQuestion) : q))
          }
          if (payload.eventType === 'DELETE') {
            return prev.filter((q) => q.id !== (payload.old as TQuestion).id)
          }
          return prev
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  function handleCreated(created: TQuestion) {
    setQuestions((prev) => [created, ...prev])
  }

  function handleUpdated(updated: TQuestion) {
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
  }

  function handleDeleted(removed: TQuestion) {
    setQuestions((prev) => prev.filter((q) => q.id !== removed.id))
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Questions {questions.length > 0 && <span className="text-sm text-muted-foreground">({questions.length})</span>}</h1>
      </div>
      <div className="max-w-2xl">
        <AddQuestionModal onCreated={handleCreated} />
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <QuestionList questions={questions} onUpdated={handleUpdated} onDeleted={handleDeleted} showQuizTitle />)
      }
    </div>
  )
}


