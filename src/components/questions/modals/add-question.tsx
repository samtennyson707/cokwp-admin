import { useEffect, useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { showErrorToast, showSuccessToast } from '@/lib/toast-util'
import { createQuestion } from '@/services/questions'
import type { TQuestion } from '@/types/question'
import QuestionForm from '@/components/questions/question-form'
import { z } from 'zod'
import { questionFormSchema } from '@/lib/validation-schemas'
import type { TQuiz } from '@/types/quiz'
import { fetchQuizzes } from '@/services/quizzes'

type AddQuestionModalProps = {
  onCreated?: (question: TQuestion) => void
  preferQuizId?: string
}

export default function AddQuestionModal({ onCreated, preferQuizId }: AddQuestionModalProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [quizzes, setQuizzes] = useState<TQuiz[]>([])
  const [loadingQuizzes, setLoadingQuizzes] = useState<boolean>(false)

  useEffect(() => {
    async function loadQuizzes() {
      try {
        setLoadingQuizzes(true)
        const data = await fetchQuizzes()
        if (preferQuizId) {
          const preferred = data.find((q) => q.id === preferQuizId)
          const rest = data.filter((q) => q.id !== preferQuizId)
          setQuizzes(preferred ? [preferred, ...rest] : data)
        } else {
          setQuizzes(data)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load quizzes'
        showErrorToast(message)
      } finally {
        setLoadingQuizzes(false)
      }
    }
    if (open) loadQuizzes()
  }, [open, preferQuizId])

  const handleReset = () => {
    setOpen(false)
  }

  async function handleSubmit(values: z.input<typeof questionFormSchema>) {
    try {
      const created = await createQuestion(values)
      onCreated?.(created)
      showSuccessToast('Question created')
      handleReset()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showErrorToast(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Question</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl w-full p-6 rounded-lg bg-card">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {loadingQuizzes ? (
            <div>Loading...</div>
          ) : (
            <QuestionForm quizzes={quizzes} onSubmit={handleSubmit} submitLabel="Create" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


