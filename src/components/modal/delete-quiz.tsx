import { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { showErrorToast, showSuccessToast } from '@/lib/toast-util'
import { deleteQuiz } from '@/services/quizzes'
import type { TQuiz } from '@/types/quiz'

type DeleteQuizModalProps = {
  quiz: TQuiz
  onDeleted?: (quiz: TQuiz) => void
}

export default function DeleteQuizModal({ quiz, onDeleted }: DeleteQuizModalProps) {
  const [open, setOpen] = useState<boolean>(false)

  const handleClose = () => setOpen(false)

  async function handleConfirmDelete() {
    try {
      await deleteQuiz(quiz.id)
      onDeleted?.(quiz)
      showSuccessToast('Quiz deleted')
      handleClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showErrorToast(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full p-6 rounded-lg bg-card">
        <DialogHeader>
          <DialogTitle>Delete quiz?</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete "{quiz.title}"? This action cannot be undone.</p>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


