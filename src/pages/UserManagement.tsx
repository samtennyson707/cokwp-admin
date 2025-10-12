import { AddUserModal } from '@/components/modal/add-user'
import { ResponsiveTable, type ColumnDef } from '@/components/responsive-table'
import { supabase } from '@/services/supabase'
import type { TProfile } from '@/types/profile'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function UserManagement() {
  const [users, setUsers] = useState<TProfile[]>([])

  async function fetchProfile() {
    const { data, error } = await supabase.from("profiles").select("*")
    if (error) {
      throw new Error(error.message)
    }
    const filteredUsers = data.filter((user) => user.isAdmin === false)
    setUsers(filteredUsers)
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
      className: 'min-w-[80px]',
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

  function renderUsersData(users: TProfile[]) {
    return <ResponsiveTable
      data={users}
      columns={columns}
      rowKey={(row) => row.id}
    />
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage users and their permissions</p>
        </div>
        <AddUserModal />
      </div>

      {renderUsersData(users)}
    </div>
  )
}