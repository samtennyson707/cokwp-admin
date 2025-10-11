import { AddUserModal } from '@/components/modal/add-user'
import { ResponsiveTable, type ColumnDef } from '@/components/responsive-table'
import { supabase } from '@/services/supabase'
import type { TProfile } from '@/types/profile'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [users, setUsers] = useState<TProfile[]>([])

  async function fetchProfile() {
    const { data, error } = await supabase.from("profiles").select("*")
    if (error) {
      throw new Error(error.message)
    }
    return data
  }

  useEffect(() => {
    fetchProfile().then((profile) => {
      console.log(profile)
      if (!profile) {
      }
      setUsers(profile)
    })
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