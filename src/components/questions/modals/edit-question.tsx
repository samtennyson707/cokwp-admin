import { useState, useEffect } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { showErrorToast, showSuccessToast } from '@/lib/toast-util'
import { updateQuestion } from '@/services/questions'
import type { TQuestion } from '@/types/question'
import QuestionForm from '@/components/questions/question-form'
import { z } from 'zod'
import { questionFormSchema } from '@/lib/validation-schemas'
import type { TQuiz } from '@/types/quiz'
import { fetchQuizzes } from '@/services/quizzes'

type EditQuestionModalProps = {
  question: TQuestion
  onUpdated?: (question: TQuestion) => void
}

export default function EditQuestionModal({ question, onUpdated }: EditQuestionModalProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [current, setCurrent] = useState<TQuestion>(question)
  const [quizzes, setQuizzes] = useState<TQuiz[]>([])
  const [loadingQuizzes, setLoadingQuizzes] = useState<boolean>(false)

  useEffect(() => {
    if (open) setCurrent(question)
  }, [open, question])

  useEffect(() => {
    async function loadQuizzes() {
      try {
        setLoadingQuizzes(true)
        const data = await fetchQuizzes()
        setQuizzes(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load quizzes'
        showErrorToast(message)
      } finally {
        setLoadingQuizzes(false)
      }
    }
    if (open) loadQuizzes()
  }, [open])

  const handleReset = () => {
    setOpen(false)
  }

  async function handleSubmit(values: z.input<typeof questionFormSchema>) {
    try {
      const updated = await updateQuestion(current.id, {
        question_text: values.question_text,
        options: values.options,
        correct_answer: values.correct_answer,
      })
      onUpdated?.(updated)
      showSuccessToast('Question updated')
      handleReset()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showErrorToast(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl w-full p-6 rounded-lg bg-card">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {loadingQuizzes ? (
            <div>Loading...</div>
          ) : (
            <QuestionForm quizzes={quizzes} initialValue={current} onSubmit={handleSubmit} submitLabel="Update" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


