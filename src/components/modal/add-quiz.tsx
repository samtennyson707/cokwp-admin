import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { quizFormSchema } from '@/lib/validation-schemas'
import { showErrorToast, showSuccessToast } from '@/lib/toast-util'
import { useProfileStore } from '@/store/profile-store'
import { createQuiz } from '@/services/quizzes'
import type { TQuiz } from '@/types/quiz'

type AddQuizModalProps = {
  onCreated?: (quiz: TQuiz) => void
}

export default function AddQuizModal({ onCreated }: AddQuizModalProps) {
  const { profile } = useProfileStore()
  const [open, setOpen] = useState<boolean>(false)
  const form = useForm<z.input<typeof quizFormSchema>>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: '',
      description: '',
      is_active: true,
    },
  })

  const handleReset = () => {
    form.reset()
    setOpen(false)
  }

  async function onSubmit(values: z.input<typeof quizFormSchema>) {
    if (!profile?.id) {
      showErrorToast('Missing user context')
      return
    }
    try {
      const created = await createQuiz(values, profile.id)
      onCreated?.(created)
      showSuccessToast('Quiz created')
      handleReset()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showErrorToast(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Quiz</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full p-6 rounded-lg bg-card">
        <DialogHeader>
          <DialogTitle>Add Quiz</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormControl>
                        <Input id="title" placeholder="Quiz title" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormControl>
                        <Input id="description" placeholder="Description (optional)" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Create</Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}


