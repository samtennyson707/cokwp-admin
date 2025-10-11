import { useEffect, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { quizFormSchema } from '@/lib/validation-schemas'
import { showErrorToast, showSuccessToast } from '@/lib/toast-util'
import { updateQuiz } from '@/services/quizzes'
import type { TQuiz } from '@/types/quiz'

type EditQuizModalProps = {
  quiz: TQuiz
  onUpdated?: (quiz: TQuiz) => void
}

export default function EditQuizModal({ quiz, onUpdated }: EditQuizModalProps) {
  const [open, setOpen] = useState<boolean>(false)
  const form = useForm<z.input<typeof quizFormSchema>>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: '',
      description: '',
      is_active: true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        title: quiz.title,
        description: quiz.description ?? '',
        is_active: quiz.is_active,
      })
    }
  }, [open, quiz, form])

  const handleReset = () => {
    setOpen(false)
  }

  async function onSubmit(values: z.input<typeof quizFormSchema>) {
    try {
      const updated = await updateQuiz(quiz.id, values)
      onUpdated?.(updated)
      showSuccessToast('Quiz updated')
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
      <DialogContent className="max-w-md w-full p-6 rounded-lg bg-card">
        <DialogHeader>
          <DialogTitle>Edit Quiz</DialogTitle>
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
                <Button type="submit">Update</Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}


