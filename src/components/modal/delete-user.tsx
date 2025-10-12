import { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { showErrorToast, showSuccessToast } from '@/lib/toast-util'
import { deleteProfile } from '@/services/profiles'
import type { TProfile } from '@/types/profile'

type DeleteUserModalProps = {
  user: TProfile
  onDeleted?: (user: TProfile) => void
}

export default function DeleteUserModal({ user, onDeleted }: DeleteUserModalProps) {
  const [open, setOpen] = useState<boolean>(false)

  function handleClose(): void {
    setOpen(false)
  }

  async function handleConfirmDelete(): Promise<void> {
    try {
      await deleteProfile(user.id)
      onDeleted?.(user)
      showSuccessToast('User deleted successfully')
      handleClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showErrorToast(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">Delete User</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full p-6 rounded-lg bg-card">
        <DialogHeader>
          <DialogTitle>Delete User?</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-medium text-foreground">{user.first_name} {user.last_name}</span>? 
            This action cannot be undone and will permanently remove all associated data.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

