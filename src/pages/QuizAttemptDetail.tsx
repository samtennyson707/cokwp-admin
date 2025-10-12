import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchQuizAttemptById } from '@/services/quiz-attempts'
import { fetchAnswersByAttemptId } from '@/services/answers'
import { fetchProfilesByIds } from '@/services/profiles'
import type { TQuizAttempt, QuizSnapshot } from '@/types/quiz-attempt'
import type { TAnswer } from '@/types/answer'
import type { TProfile } from '@/types/profile'
import type { TQuestion } from '@/types/question'
import { showErrorToast } from '@/lib/toast-util'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

type QuestionWithAnswer = {
  question: TQuestion
  answer: TAnswer | undefined
}

export default function QuizAttemptDetail() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const [attempt, setAttempt] = useState<TQuizAttempt | null>(null)
  const [quizSnapshot, setQuizSnapshot] = useState<QuizSnapshot | null>(null)
  const [profile, setProfile] = useState<TProfile | null>(null)
  const [questionsWithAnswers, setQuestionsWithAnswers] = useState<QuestionWithAnswer[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  
  useEffect(() => {
    async function loadAttemptDetails() {
      if (!attemptId) return
      try {
        setIsLoading(true)
        const attemptData = await fetchQuizAttemptById(attemptId)
        setAttempt(attemptData)
        if (!attemptData.snapshot_quiz) {
          throw new Error('Quiz snapshot not found in attempt record')
        }
        setQuizSnapshot(attemptData.snapshot_quiz)
        const [profileData] = await fetchProfilesByIds([attemptData.user_id])
        if (!profileData) {
          throw new Error('User profile not found')
        }
        setProfile(profileData)
        const answers = await fetchAnswersByAttemptId(attemptId)
        const combined: QuestionWithAnswer[] = attemptData.snapshot_quiz.questions.map((question) => {
          const answer = answers.find((a) => a.question_id === question.id)
          return { question, answer }
        })
        setQuestionsWithAnswers(combined)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load attempt details'
        showErrorToast(message)
      } finally {
        setIsLoading(false)
      }
    }
    loadAttemptDetails()
  }, [attemptId])

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Quiz Attempt Details</h1>
          <Link to="/results">
            <Button variant="outline">Back to Results</Button>
          </Link>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!attempt || !quizSnapshot || !profile) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Quiz Attempt Details</h1>
          <Link to="/results">
            <Button variant="outline">Back to Results</Button>
          </Link>
        </div>
        <Card>
          <CardContent>
            <p className="text-muted-foreground">Attempt not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const answeredQuestions = questionsWithAnswers.filter((qa) => qa.answer !== undefined)
  const correctAnswersCount = questionsWithAnswers.filter((qa) => qa.answer?.is_correct).length
  const incorrectAnswersCount = questionsWithAnswers.filter((qa) => qa.answer && !qa.answer.is_correct).length
  const unansweredCount = questionsWithAnswers.length - answeredQuestions.length
  const totalQuestions = questionsWithAnswers.length
  const percentage = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0
  const duration = calculateDuration(attempt.started_at, attempt.completed_at)
  const isCompleted = attempt.completed_at !== null && attempt.completed_at !== undefined

  return (
    <div className="w-full space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quiz Attempt Details</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ID: {attemptId?.slice(0, 8)}... • 
            {isCompleted ? (
              <span className="ml-2 text-emerald-600 dark:text-emerald-400">✓ Completed</span>
            ) : (
              <span className="ml-2 text-amber-600 dark:text-amber-400">⏳ In Progress</span>
            )}
          </p>
        </div>
        <Link to="/results">
          <Button variant="outline">Back to Results</Button>
        </Link>
      </div>

      {/* User Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Details about the participant</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Name" value={`${profile.first_name} ${profile.last_name}`} />
            <InfoItem label="Email" value={profile.email} />
            {profile.phone && <InfoItem label="Phone" value={profile.phone} />}
            <InfoItem label="User ID" value={profile.id.slice(0, 8) + '...'} />
          </div>
        </CardContent>
      </Card>

      {/* Quiz Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Information</CardTitle>
          <CardDescription>Snapshot at the time of attempt</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Title" value={quizSnapshot.title} />
            <InfoItem label="Total Questions" value={totalQuestions.toString()} />
            <InfoItem 
              label="Status (at time)" 
              value={quizSnapshot.is_active ? '🟢 Active' : '🔴 Inactive'} 
            />
            <InfoItem 
              label="Quiz ID" 
              value={quizSnapshot.id.slice(0, 8) + '...'} 
            />
            {quizSnapshot.description && <InfoItem label="Description" value={quizSnapshot.description} className="md:col-span-2" />}
            {quizSnapshot.created_at && (
              <InfoItem 
                label="Quiz Created" 
                value={formatDateTime(quizSnapshot.created_at)} 
                className="md:col-span-2"
              />
            )}
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              ℹ️ This shows the quiz as it was when the user took it. Any subsequent changes to the quiz are not reflected here.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Score Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Score Summary</CardTitle>
          <CardDescription>
            {isCompleted ? 'Performance breakdown' : 'Attempt in progress'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <ScoreCard
              label="Total Score"
              value={attempt.score?.toString() ?? 'N/A'}
              className="bg-primary/10 border-primary/20"
            />
            <ScoreCard
              label="Correct"
              value={correctAnswersCount.toString()}
              className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800"
            />
            <ScoreCard
              label="Incorrect"
              value={incorrectAnswersCount.toString()}
              className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
            />
            <ScoreCard
              label="Unanswered"
              value={unansweredCount.toString()}
              className="bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800"
            />
            <ScoreCard
              label="Percentage"
              value={`${percentage}%`}
              className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
            />
          </div>
        </CardContent>
      </Card>

      {/* Attempt Timeline Card */}
      <Card>
        <CardHeader>
          <CardTitle>Attempt Timeline</CardTitle>
          <CardDescription>Time-related details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoItem
              label="Started At"
              value={attempt.started_at ? formatDateTime(attempt.started_at) : 'N/A'}
            />
            <InfoItem
              label="Completed At"
              value={attempt.completed_at ? formatDateTime(attempt.completed_at) : 'Not completed'}
            />
            <InfoItem label="Duration" value={duration} />
          </div>
        </CardContent>
      </Card>

      {/* Questions and Answers */}
      <Card>
        <CardHeader>
          <CardTitle>Questions & Answers</CardTitle>
          <CardDescription>
            Detailed review of each question • {answeredQuestions.length} of {totalQuestions} answered
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {questionsWithAnswers.map((qa, index) => (
            <QuestionAnswerCard
              key={qa.question.id}
              questionNumber={index + 1}
              question={qa.question}
              answer={qa.answer}
            />
          ))}
          {questionsWithAnswers.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No questions found for this quiz</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

type InfoItemProps = {
  label: string
  value: string
  className?: string
}

function InfoItem({ label, value, className = '' }: InfoItemProps) {
  return (
    <div className={className}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base mt-1">{value}</p>
    </div>
  )
}

type ScoreCardProps = {
  label: string
  value: string
  className?: string
}

function ScoreCard({ label, value, className = '' }: ScoreCardProps) {
  return (
    <div className={`rounded-lg border p-4 text-center ${className}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

type QuestionAnswerCardProps = {
  questionNumber: number
  question: TQuestion
  answer: TAnswer | undefined
}

function QuestionAnswerCard({ questionNumber, question, answer }: QuestionAnswerCardProps) {
  const isCorrect = answer?.is_correct ?? false
  const hasAnswer = answer !== undefined

  return (
    <div
      className={`rounded-lg border p-4 ${
        !hasAnswer
          ? 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900'
          : isCorrect
          ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950'
          : 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium">
          Question {questionNumber}
          {hasAnswer && (
            <span
              className={`ml-3 text-sm px-2 py-0.5 rounded-full ${
                isCorrect
                  ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                  : 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </span>
          )}
          {!hasAnswer && (
            <span className="ml-3 text-sm px-2 py-0.5 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
              Not Answered
            </span>
          )}
        </h3>
      </div>

      <p className="text-base mb-4">{question.question_text}</p>

      <Separator className="my-3" />

      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.options.map((option, idx) => {
            const isSelected = answer?.selected_option === option
            const isCorrectOption = question.correct_answer === option
            const showAsCorrect = isCorrectOption && (!hasAnswer || !isCorrect)
            const showAsWrong = isSelected && !isCorrect

            return (
              <div
                key={idx}
                className={`p-3 rounded-md border ${
                  showAsCorrect
                    ? 'border-emerald-400 bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900'
                    : showAsWrong
                    ? 'border-red-400 bg-red-100 dark:border-red-700 dark:bg-red-900'
                    : isSelected
                    ? 'border-emerald-400 bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{option}</span>
                  {isSelected && (
                    <span className="text-xs font-medium">Your Answer</span>
                  )}
                  {isCorrectOption && (
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      ✓ Correct Answer
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function calculateDuration(startedAt: string | undefined, completedAt: string | null | undefined): string {
  if (!startedAt || !completedAt) return 'N/A'
  const start = new Date(startedAt).getTime()
  const end = new Date(completedAt).getTime()
  const durationMs = end - start
  if (durationMs < 0) return 'N/A'
  const minutes = Math.floor(durationMs / 60000)
  const seconds = Math.floor((durationMs % 60000) / 1000)
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

