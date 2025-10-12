import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchQuizAttempts } from '@/services/quiz-attempts'
import type { TQuizAttempt } from '@/types/quiz-attempt'
import { showErrorToast } from '@/lib/toast-util'
import { supabase } from '@/services/supabase'
import { fetchAnswersByAttemptId } from '@/services/answers'
import type { TAnswer } from '@/types/answer'
import type { TQuiz } from '@/types/quiz'
import type { TProfile } from '@/types/profile'
import { fetchQuizzesByIds } from '@/services/quizzes'
import { fetchProfilesByIds } from '@/services/profiles'
import { ResponsiveTable, type ColumnDef } from '@/components/responsive-table'
import { Button } from '@/components/ui/button'
import { ActionMenu } from '@/components/action-menu'
import { MoreHorizontal } from 'lucide-react'

export default function QuizResults() {
  const navigate = useNavigate()
  const [attempts, setAttempts] = useState<TQuizAttempt[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(null)
  const [answersByAttemptId, setAnswersByAttemptId] = useState<Record<string, TAnswer[]>>({})
  const [quizById, setQuizById] = useState<Record<string, TQuiz>>({})
  const [profileById, setProfileById] = useState<Record<string, TProfile>>({})

  useEffect(() => {
    async function loadAttempts() {
      try {
        setIsLoading(true)
        const data = await fetchQuizAttempts()
        setAttempts(data)
        // Fetch referenced quizzes and profiles for richer UI
        const quizIds = Array.from(new Set(data.map((a) => a.quiz_id)))
        const userIds = Array.from(new Set(data.map((a) => a.user_id)))
        const [quizzes, profiles] = await Promise.all([
          fetchQuizzesByIds(quizIds),
          fetchProfilesByIds(userIds),
        ])
        setQuizById(Object.fromEntries(quizzes.map((q) => [q.id, q])))
        setProfileById(Object.fromEntries(profiles.map((p) => [p.id, p])))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load results'
        showErrorToast(message)
      } finally {
        setIsLoading(false)
      }
    }
    loadAttempts()
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('results-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_attempts' }, (payload) => {
        setAttempts((prev) => {
          if (payload.eventType === 'INSERT') return [payload.new as TQuizAttempt, ...prev]
          if (payload.eventType === 'UPDATE') return prev.map((a) => (a.id === (payload.new as TQuizAttempt).id ? (payload.new as TQuizAttempt) : a))
          if (payload.eventType === 'DELETE') return prev.filter((a) => a.id !== (payload.old as TQuizAttempt).id)
          return prev
        })
        // Ensure we have quiz/user data for new updates
        const newAttempt = (payload.new as TQuizAttempt) || null
        if (newAttempt) {
          const ensureDetails = async () => {
            if (newAttempt.quiz_id && !quizById[newAttempt.quiz_id]) {
              try {
                const [quiz] = await fetchQuizzesByIds([newAttempt.quiz_id])
                if (quiz) setQuizById((prev) => ({ ...prev, [quiz.id]: quiz }))
              } catch (err) {
                console.error('Failed to fetch quiz:', err)
              }
            }
            if (newAttempt.user_id && !profileById[newAttempt.user_id]) {
              try {
                const [profile] = await fetchProfilesByIds([newAttempt.user_id])
                if (profile) setProfileById((prev) => ({ ...prev, [profile.id]: profile }))
              } catch (err) {
                console.error('Failed to fetch profile:', err)
              }
            }
          }
          void ensureDetails()
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'answers' }, (payload) => {
        // invalidate cached answers for the attempt
        const attemptId = (payload.new as TAnswer)?.attempt_id ?? (payload.old as TAnswer)?.attempt_id
        if (attemptId) {
          setAnswersByAttemptId((prev) => {
            const next = { ...prev }
            delete next[attemptId]
            return next
          })
        }
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleToggle(attemptId: string) {
    setExpandedAttemptId((prev) => (prev === attemptId ? null : attemptId))
    if (!answersByAttemptId[attemptId]) {
      try {
        const answers = await fetchAnswersByAttemptId(attemptId)
        setAnswersByAttemptId((prev) => ({ ...prev, [attemptId]: answers }))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load answers'
        showErrorToast(message)
      }
    }
  }

  function handleViewDetails(attemptId: string) {
    navigate(`/results/${attemptId}`)
  }

  const columns: readonly ColumnDef<TQuizAttempt>[] = [
    {
      id: 'attempt',
      header: 'Attempt',
      cell: (row) => <span className="font-medium">{row.id.slice(0, 8)}...</span>,
      minWidth: 120,
      cardLabel: 'Attempt',
      cardOrder: 1,
    },
    {
      id: 'quiz',
      header: 'Quiz',
      cell: (row) => <span>{quizById[row.quiz_id]?.title ?? row.quiz_id}</span>,
      minWidth: 200,
      cardLabel: 'Quiz',
      cardOrder: 2,
    },
    {
      id: 'user',
      header: 'User',
      cell: (row) => {
        const p = profileById[row.user_id]
        const name = p ? `${p.first_name} ${p.last_name}` : row.user_id
        return <span>{name}</span>
      },
      minWidth: 180,
      cardLabel: 'User',
      cardOrder: 3,
    },
    {
      id: 'started',
      header: 'Started',
      cell: (row) => <span className="text-xs text-muted-foreground">{row.started_at ? new Date(row.started_at).toLocaleString() : '-'}</span>,
      minWidth: 180,
      cardLabel: 'Started',
      cardOrder: 4,
    },
    {
      id: 'completed',
      header: 'Completed',
      cell: (row) => <span className="text-xs text-muted-foreground">{row.completed_at ? new Date(row.completed_at).toLocaleString() : '—'}</span>,
      minWidth: 180,
      cardLabel: 'Completed',
      cardOrder: 5,
    },
    {
      id: 'score',
      header: 'Score',
      cell: (row) => <span className="font-medium">{typeof row.score === 'number' ? row.score : '—'}</span>,
      minWidth: 80,
      cardLabel: 'Score',
      cardOrder: 6,
    },
  ]

  function QuizResultsActions({ lead }: { lead: TQuizAttempt }) {
    // const openEditLead = (l: TQuizAttempt) => {
    //   setEditingLead(l);
    //   setIsUpdateLeadOpen(true);
    // };

    // const openAssignAgent = (l: TQuizAttempt) => {
    //   if (!l?.id) return;
    //   setAssignLeadId(l.id);
    //   setIsAssignAgentOpen(true);
    // };

    const canAssignAgent = true;
    const menuItems = [
      { id: 'view', label: 'View Details', onSelect: () => navigate(`/results/${lead?.id || 'unknown'}`) },
      { id: 'edit', label: 'Edit Lead', onSelect: () => { } },
      ...(canAssignAgent ? [{ id: 'assign', label: 'Assign Agent', onSelect: () => { } }] : []),
    ];

    return (
      <div className="relative">
        <ActionMenu
          trigger={
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-gray-100">
              <MoreHorizontal className="h-3 w-3 text-gray-400" />
            </Button>
          }
          items={menuItems}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Quiz Results {attempts.length > 0 && <span className="text-sm text-muted-foreground">({attempts.length})</span>}</h1>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <ResponsiveTable
            data={attempts}
            columns={columns}
            rowKey={(row) => row.id}
            renderCardTitle={(row) => `Attempt ${row.id.slice(0, 8)}...`}
            renderCardSubtitle={(row) => {
              const quizTitle = quizById[row.quiz_id]?.title ?? row.quiz_id
              const p = profileById[row.user_id]
              const name = p ? `${p.first_name} ${p.last_name}` : row.user_id
              return (
                <span className="text-xs text-muted-foreground">{quizTitle} • {name}</span>
              )
            }}
            renderRowEndActions={(row) => (
              <QuizResultsActions lead={row} />
            )}
          // renderRowEndActions={(row) => (
          //   <div className="flex gap-2 relative">
          //     <Button
          //       size="sm"
          //       variant="outline"
          //       onClick={() => handleViewDetails(row.id)}
          //     >
          //       View Details
          //     </Button>
          //   </div>
          // )}
          />
        </>
      )}
    </div>
  )
}


