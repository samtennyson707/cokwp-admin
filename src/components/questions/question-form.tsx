import { useEffect } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { questionFormSchema } from '@/lib/validation-schemas'
import type { TQuestion } from '@/types/question'
import type { TQuiz } from '@/types/quiz'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'

type QuestionFormProps = {
  quizzes: readonly TQuiz[]
  initialValue?: TQuestion | null
  onSubmit: (values: z.input<typeof questionFormSchema>) => Promise<void> | void
  submitLabel?: string
}

export default function QuestionForm({ quizzes, initialValue = null, onSubmit, submitLabel = 'Save' }: QuestionFormProps) {
  const form = useForm<z.input<typeof questionFormSchema>>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      quiz_id: initialValue?.quiz_id ?? (quizzes[0]?.id ?? ''),
      question_text: '',
      options: ['', ''],
      correct_answer: '',
    },
  })

  useEffect(() => {
    if (initialValue) {
      form.reset({
        quiz_id: initialValue.quiz_id,
        question_text: initialValue.question_text,
        options: [...initialValue.options],
        correct_answer: initialValue.correct_answer,
      })
    } else {
      if (!form.getValues('quiz_id') && quizzes.length > 0) {
        form.setValue('quiz_id', quizzes[0].id)
      }
    }
  }, [initialValue, form, quizzes])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="quiz_id"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <select
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {quizzes.map((q) => (
                    <option key={q.id} value={q.id}>{q.title}</option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="question_text"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Question text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="options"
          render={({ field }) => (
            <FormItem>
              <div className="space-y-2">
                {field.value.map((opt: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const next = [...field.value]
                        next[i] = e.target.value
                        field.onChange(next)
                      }}
                    />
                    {field.value.length > 2 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => field.onChange(field.value.filter((_, idx) => idx !== i))}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => field.onChange([...field.value, ''])}>Add option</Button>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="correct_answer"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Correct answer (must match an option)" {...field} />
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


