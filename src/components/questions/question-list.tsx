import type { TQuestion } from '@/types/question'
import EditQuestionModal from './modals/edit-question'
import DeleteQuestionModal from './modals/delete-question'

type QuestionListProps = {
  questions: readonly TQuestion[]
  onUpdated: (question: TQuestion) => void
  onDeleted: (question: TQuestion) => void
  showQuizTitle?: boolean
  quizTitleById?: Record<string, string>
}

export default function QuestionList({ questions, onUpdated, onDeleted, showQuizTitle = false, quizTitleById = {} }: QuestionListProps) {
  return (
    <div className="space-y-2 w-full">
      {questions.map((q) => (
        <div key={q.id} className="flex items-start justify-between rounded-md border p-3">
          <div className="flex flex-col">
            <span className="font-medium">{q.question_text}</span>
            <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-3">
              <span>
                Correct answer: <span className="font-medium text-emerald-700">{q.correct_answer}</span>
              </span>
              <span>Options: {q.options.length}</span>
              {showQuizTitle && quizTitleById[q.quiz_id] && (
                <span>Quiz: <span className="font-medium">{quizTitleById[q.quiz_id]}</span></span>
              )}
              {q.created_at && <span>Created: {new Date(q.created_at).toLocaleString()}</span>}
            </div>
            <div className="mt-2 space-y-2">
              {q.options.map((opt, idx) => {
                const isCorrect = opt === q.correct_answer
                const letter = String.fromCharCode(65 + idx)
                return (
                  <div
                    key={idx}
                    className={
                      `flex items-center gap-3 rounded-md border p-2 ` +
                      (isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-border')
                    }
                  >
                    <div
                      className={
                        `h-5 w-5 shrink-0 rounded-full border flex items-center justify-center ` +
                        (isCorrect ? 'border-emerald-500 text-emerald-600' : 'border-muted-foreground text-muted-foreground')
                      }
                      aria-hidden
                    >
                      {isCorrect ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : (
                        <span className="h-2 w-2 rounded-full" />
                      )}
                    </div>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {letter}
                    </span>
                    <span className={isCorrect ? 'text-emerald-800 font-medium' : ''}>{opt}</span>
                    {isCorrect && <span className="ml-2 text-xs text-emerald-700">(Correct)</span>}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <EditQuestionModal question={q} onUpdated={onUpdated} />
            <DeleteQuestionModal question={q} onDeleted={onDeleted} />
          </div>
        </div>
      ))}
    </div>
  )
}


