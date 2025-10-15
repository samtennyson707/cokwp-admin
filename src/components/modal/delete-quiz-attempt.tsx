import { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { showErrorToast, showSuccessToast } from '@/lib/toast-util'
import { deleteQuizAttempt } from '@/services/quiz-attempts'
import type { TQuizAttempt } from '@/types/quiz-attempt'
import { useProfileStore } from '@/store/profile-store'

type DeleteQuizAttemptModalProps = {
  attempt: TQuizAttempt
  onDeleted?: (attempt: TQuizAttempt) => void
}

export default function DeleteQuizAttemptModal({ attempt, onDeleted }: DeleteQuizAttemptModalProps) {
  const [open, setOpen] = useState<boolean>(false)
  const { isAdmin } = useProfileStore()

  function handleClose(): void {
    setOpen(false)
  }

  async function handleConfirmDelete(): Promise<void> {
    try {
      await deleteQuizAttempt(attempt.id)
      onDeleted?.(attempt)
      showSuccessToast('Result deleted')
      handleClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showErrorToast(errorMessage)
    }
  }

  if (!isAdmin) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive" data-delete-attempt-trigger={attempt.id}>Delete</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full p-6 rounded-lg bg-card">
        <DialogHeader>
          <DialogTitle>Delete quiz result?</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete attempt "{attempt.id}"? This action cannot be undone.</p>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


