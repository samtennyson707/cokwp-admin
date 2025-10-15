import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchQuizAttempts } from '@/services/quiz-attempts'
import type { TQuizAttempt } from '@/types/quiz-attempt'
import { showErrorToast } from '@/lib/toast-util'
import { supabase } from '@/services/supabase'
import type { TQuiz } from '@/types/quiz'
import type { TProfile } from '@/types/profile'
import { fetchQuizzesByIds } from '@/services/quizzes'
import { fetchProfilesByIds } from '@/services/profiles'
import { ResponsiveTable, type ColumnDef } from '@/components/responsive-table'
import { Button } from '@/components/ui/button'
import { ActionMenu } from '@/components/action-menu'
import { MoreHorizontal } from 'lucide-react'
import DeleteQuizAttemptModal from '@/components/modal/delete-quiz-attempt'
import { useProfileStore } from '@/store/profile-store'

export default function QuizResults() {
  const navigate = useNavigate()
  const [attempts, setAttempts] = useState<TQuizAttempt[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [quizById, setQuizById] = useState<Record<string, TQuiz>>({})
  const [profileById, setProfileById] = useState<Record<string, TProfile>>({})
  const { isAdmin } = useProfileStore()

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
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columns: readonly ColumnDef<TQuizAttempt>[] = [
    {
      id: 'id',
      header: 'ID',
      className: 'min-w-[60px]',
      cell: (row) => <Link to={`/results/${row.id}`} className="text-xs font-medium text-left hover:underline">{row.id}</Link>,
      minWidth: 120,
      cardLabel: 'ID',
      cardOrder: 1,
    },
    {
      id: 'quiz',
      header: 'Quiz',
      cell: (row) => {
        const quizTitle = row.snapshot_quiz?.title ?? quizById[row.quiz_id]?.title ?? row.quiz_id
        return <Link to={`/quizzes/${row.quiz_id}`} className="text-xs font-medium text-left hover:underline">{quizTitle}</Link>
      },
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
    const onDeleted = (attempt: TQuizAttempt) => {
      setAttempts((prev) => prev.filter((a) => a.id !== attempt.id))
    }
    // const openEditLead = (l: TQuizAttempt) => {
    //   setEditingLead(l);
    //   setIsUpdateLeadOpen(true);
    // };

    // const openAssignAgent = (l: TQuizAttempt) => {
    //   if (!l?.id) return;
    //   setAssignLeadId(l.id);
    //   setIsAssignAgentOpen(true);
    // };

    const menuItems = [
      { id: 'view', label: 'View Details', onSelect: () => navigate(`/results/${lead?.id || 'unknown'}`) },
      ...(isAdmin ? [{ id: 'delete', label: 'Delete Result', onSelect: () => {
        const btn = document.querySelector(`[data-delete-attempt-trigger="${lead.id}"]`) as HTMLElement | null
        btn?.click()
      }}] : []),
    ] as const

    return (
      <div className="relative">
        {/* Hidden modal trigger for programmatic open */}
        {isAdmin && (
          <div className="hidden">
            <span data-delete-attempt={lead.id}>
              <DeleteQuizAttemptModal attempt={lead} onDeleted={onDeleted} />
            </span>
          </div>
        )}
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
              const quizTitle = row.snapshot_quiz?.title ?? quizById[row.quiz_id]?.title ?? row.quiz_id
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


