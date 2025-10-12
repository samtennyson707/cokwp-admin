import type { TQuiz } from '@/types/quiz'
import EditQuizModal from '@/components/modal/edit-quiz'
import DeleteQuizModal from '@/components/modal/delete-quiz'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { ResponsiveTable, type ColumnDef } from '../responsive-table'
import { Switch } from '@/components/ui/switch'
import { ActionMenu } from '@/components/action-menu'
import { MoreHorizontal } from 'lucide-react'
import { toggleQuizStatus } from '@/services/quizzes'
import { showErrorToast, showSuccessToast } from '@/lib/toast-util'
import { useState } from 'react'

type QuizListProps = {
  quizzes: readonly TQuiz[]
  onUpdated: (quiz: TQuiz) => void
  onDeleted: (quiz: TQuiz) => void
}

export default function QuizList({ quizzes, onUpdated, onDeleted }: QuizListProps) {
  const navigate = useNavigate()
  const [isToggling, setIsToggling] = useState<Record<string, boolean>>({})

  async function handleToggleStatus(quiz: TQuiz) {
    if (isToggling[quiz.id]) return
    try {
      setIsToggling((prev) => ({ ...prev, [quiz.id]: true }))
      const updated = await toggleQuizStatus(quiz.id, !quiz.is_active)
      onUpdated(updated)
      showSuccessToast(`Quiz ${updated.is_active ? 'activated' : 'deactivated'} successfully`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update quiz status'
      showErrorToast(message)
    } finally {
      setIsToggling((prev) => ({ ...prev, [quiz.id]: false }))
    }
  }

  const columns: readonly ColumnDef<TQuiz>[] = [
    {
      id: 'title',
      header: 'Title',
      cell: (row) => <span>{row.title}</span>,
      cardLabel: 'Title',
      cardOrder: 1,
    },
    {
      id: 'description',
      header: 'Description',
      cell: (row) => <span>{row.description || '-'}</span>,
      cardLabel: 'Description',
      cardOrder: 2,
    },
    
    {
      id: 'created_by',
      header: 'Created By',
      cell: (row) => <span>{row.created_by ? `${row.created_by.first_name} ${row.created_by.last_name}` : row.created_by}</span>,
      cardLabel: 'Created By',
      cardOrder: 3,
    },
    {
      id: 'is_active',
      header: 'Active',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Switch 
            checked={row.is_active} 
            onCheckedChange={() => handleToggleStatus(row)}
            disabled={isToggling[row.id]}
          />
          <span className="text-xs text-muted-foreground">
            {row.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      ),
      cardLabel: 'Active',
      cardOrder: 4,
    },
    {
      id: 'created_at',
      header: 'Created At',
      cell: (row) => <span>{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</span>,
      cardLabel: 'Created At',
      cardOrder: 5,
    },
    {
      id: 'updated_at',
      header: 'Updated At',
      cell: (row) => <span>{row.updated_at ? new Date(row.updated_at).toLocaleString() : '-'}</span>,
      cardLabel: 'Updated At',
      cardOrder: 6,
    },
  ]

  function QuizActions({ quiz }: { quiz: TQuiz }) {
    const menuItems = [
      { 
        id: 'view', 
        label: 'View Details', 
        onSelect: () => navigate(`/quizzes/${quiz.id}`) 
      },
      { 
        id: 'questions', 
        label: 'Manage Questions', 
        onSelect: () => navigate(`/questions?quizId=${quiz.id}`) 
      },
      { 
        id: 'edit', 
        label: 'Edit Quiz', 
        onSelect: () => {
          // Trigger the edit modal by clicking it programmatically
          const editButton = document.querySelector(`[data-edit-quiz="${quiz.id}"]`) as HTMLElement
          editButton?.click()
        }
      },
      { 
        id: 'delete', 
        label: 'Delete Quiz', 
        onSelect: () => {
          // Trigger the delete modal by clicking it programmatically
          const deleteButton = document.querySelector(`[data-delete-quiz="${quiz.id}"]`) as HTMLElement
          deleteButton?.click()
        }
      },
    ]

    return (
      <div className="flex items-center gap-2">
        {/* Hidden modals triggered by action menu */}
        <div className="hidden">
          <span data-edit-quiz={quiz.id}>
            <EditQuizModal quiz={quiz} onUpdated={onUpdated} />
          </span>
          <span data-delete-quiz={quiz.id}>
            <DeleteQuizModal quiz={quiz} onDeleted={onDeleted} />
          </span>
        </div>
        <ActionMenu
          trigger={
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </Button>
          }
          items={menuItems}
        />
      </div>
    )
  }

  return (
    <div className="space-y-2 w-full">
      <ResponsiveTable
        data={quizzes}
        columns={columns}
        rowKey={(row) => row.id}
        renderCardTitle={(row) => <Link to={`/quizzes/${row.id}`} className="text-base font-semibold text-foreground hover:text-primary cursor-pointer text-left truncate w-full transition-colors">{row.title}</Link>}
        onCardTitleClick={(row) => {
          navigate(`/quizzes/${row.id}`)
        }}
        renderRowEndActions={(row) => <QuizActions quiz={row} />}
      />
    </div>
  )
}


