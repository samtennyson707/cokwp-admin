 import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { quizFormSchema } from '@/lib/validation-schemas'
import type { TQuiz } from '@/types/quiz'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useEffect } from 'react'

type QuizFormProps = {
  initialValue?: TQuiz | null
  onSubmit: (values: z.input<typeof quizFormSchema>) => Promise<void> | void
  submitLabel?: string
}

export default function QuizForm({ initialValue = null, onSubmit, submitLabel = 'Save' }: QuizFormProps) {
  const form = useForm<z.input<typeof quizFormSchema>>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: '',
      description: '',
      is_active: true,
    },
  })

  useEffect(() => {
    if (initialValue) {
      form.reset({
        title: initialValue.title,
        description: initialValue.description ?? '',
        is_active: initialValue.is_active,
      })
    }
  }, [initialValue, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Quiz title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Description (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{submitLabel}</Button>
      </form>
    </Form>
  )
}


