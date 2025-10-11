import type { TQuiz } from '@/types/quiz'
import EditQuizModal from '@/components/modal/edit-quiz'
import DeleteQuizModal from '@/components/modal/delete-quiz'

type QuizListProps = {
  quizzes: readonly TQuiz[]
  onUpdated: (quiz: TQuiz) => void
  onDeleted: (quiz: TQuiz) => void
}

export default function QuizList({ quizzes, onUpdated, onDeleted }: QuizListProps) {
  return (
    <div className="space-y-2 w-full">
      {quizzes.map((quiz) => (
        <div key={quiz.id} className="flex items-center justify-between rounded-md border p-3">
          <div className="flex flex-col">
            <span className="font-medium">{quiz.title}</span>
            <span className="text-xs text-muted-foreground">{quiz.description || '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <EditQuizModal quiz={quiz} onUpdated={onUpdated} />
            <DeleteQuizModal quiz={quiz} onDeleted={onDeleted} />
          </div>
        </div>
      ))}
    </div>
  )
}


