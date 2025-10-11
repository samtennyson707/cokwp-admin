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
    setUsers(data)
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
          to={`/leads/${row.id}`}
          className="text-xs font-medium text-left"
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
          to={`/leads/${row.id}`}
          className="text-xs font-medium text-left"
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
          to={`/leads/${row.id}`}
          className="text-xs font-medium text-left"
        >
          {row.last_name}
        </Link>
      ),
      cardLabel: 'Last Name',
      cardOrder: 3,
    },
    {
      id: 'avatar_url',
      header: 'Avatar URL',
      cell: (row) => (
        <Link
          to={`/leads/${row.id}`}
          className="text-xs font-medium text-left"
        >
          {row.avatar_url}
        </Link>
      ),
      cardLabel: 'Avatar URL',
      cardOrder: 4,
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: (row) => (
        <Link
          to={`/leads/${row.id}`}
          className="text-xs font-medium text-left"
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
    <>
      <h1>Dashboard</h1>
      <AddUserModal />

      {renderUsersData(users)}
    </>
  )
}