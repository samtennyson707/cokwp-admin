import { AddUserModal } from '@/components/modal/add-user'
import EditUserModal from '@/components/modal/edit-user'
import DeleteUserModal from '@/components/modal/delete-user'
import { ResponsiveTable, type ColumnDef } from '@/components/responsive-table'
import { supabase } from '@/services/supabase'
import type { TProfile } from '@/types/profile'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ActionMenu } from '@/components/action-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

export default function UserManagement() {
  const [users, setUsers] = useState<TProfile[]>([])
  const navigate = useNavigate()

  async function fetchProfile() {
    const { data, error } = await supabase.from("profiles").select("*")
    if (error) {
      throw new Error(error.message)
    }
    const filteredUsers = data.filter((user) => user.isAdmin === false)
    setUsers(filteredUsers)
  }

  function handleUserUpdated(updatedUser: TProfile): void {
    setUsers((prev) => prev.map((user) => user.id === updatedUser.id ? updatedUser : user))
  }

  function handleUserDeleted(deletedUser: TProfile): void {
    setUsers((prev) => prev.filter((user) => user.id !== deletedUser.id))
  }

  useEffect(() => {
    fetchProfile()
    // Subscribe to realtime changes in 'profiles' table
    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('Realtime change:', payload)

          setUsers((prev) => {
            switch (payload.eventType) {
              case 'INSERT':
                return [...prev, payload.new as TProfile]
              case 'UPDATE':
                return prev.map((user) =>
                  user.id === payload.new.id ? (payload.new as TProfile) : user
                )
              case 'DELETE':
                return prev.filter((user) => user.id !== payload.old.id)
              default:
                return prev
            }
          })
        }
      )
      .subscribe()

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const columns: readonly ColumnDef<TProfile>[] = [
    {
      id: 'id',
      header: 'ID',
      className: 'min-w-[60px]',
      cell: (row) => (
        <Link
          to={`/users/${row.id}`}
          className="text-xs font-medium text-left hover:underline"
        >
          {row.id}
        </Link>
      ),
      cardLabel: 'ID',
      cardOrder: 1,
    },
    {
      id: 'first_name',
      header: 'First Name',
      cell: (row) => (
        <Link
          to={`/users/${row.id}`}
          className="text-xs font-medium text-left hover:underline"
        >
          {row.first_name}
        </Link>
      ),
      cardLabel: 'First Name',
      cardOrder: 2,
    },
    {
      id: 'last_name',
      header: 'Last Name',
      cell: (row) => (
        <Link
          to={`/users/${row.id}`}
          className="text-xs font-medium text-left hover:underline"
        >
          {row.last_name}
        </Link>
      ),
      cardLabel: 'Last Name',
      cardOrder: 3,
    },
    {
      id: 'email',
      header: 'Email',
      cell: (row) => (
        <Link
          to={`/users/${row.id}`}
          className="text-xs font-medium text-left hover:underline"
        >
          {row.email}
        </Link>
      ),
      cardLabel: 'Email',
      cardOrder: 4,
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: (row) => (
        <Link
          to={`/users/${row.id}`}
          className="text-xs font-medium text-left hover:underline"
        >
          {row.phone || '-'}
        </Link>
      ),
      cardLabel: 'Phone',
      cardOrder: 5,
    },
  ]

  function UserActions({ user }: { user: TProfile }) {
    const menuItems = [
      { 
        id: 'view', 
        label: 'View Details', 
        onSelect: () => navigate(`/users/${user.id}`) 
      },
      // { 
      //   id: 'edit', 
      //   label: 'Edit User', 
      //   onSelect: () => {
      //     const editButton = document.querySelector(`[data-edit-user="${user.id}"]`) as HTMLElement
      //     editButton?.click()
      //   }
      // },
      // { 
      //   id: 'delete', 
      //   label: 'Delete User', 
      //   onSelect: () => {
      //     const deleteButton = document.querySelector(`[data-delete-user="${user.id}"]`) as HTMLElement
      //     deleteButton?.click()
      //   }
      // },
    ]

    return (
      <div className="flex items-center gap-2">
        <div className="hidden">
          <span data-edit-user={user.id}>
            <EditUserModal user={user} onUpdated={handleUserUpdated} />
          </span>
          <span data-delete-user={user.id}>
            <DeleteUserModal user={user} onDeleted={handleUserDeleted} />
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

  function renderUsersData(users: TProfile[]) {
    return <ResponsiveTable
      data={users}
      columns={columns}
      rowKey={(row) => row.id}
      renderCardTitle={(row) => <Link to={`/users/${row.id}`} className="text-base font-semibold text-foreground hover:text-primary cursor-pointer text-left truncate w-full transition-colors">{row.first_name} {row.last_name}</Link>}
      onCardTitleClick={(row) => {
        navigate(`/users/${row.id}`)
      }}
      renderRowEndActions={(row) => <UserActions user={row} />}
    />
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage users and their permissions</p>
        </div>
        <AddUserModal onSuccess={fetchProfile} />
      </div>

      {renderUsersData(users)}
    </div>
  )
}