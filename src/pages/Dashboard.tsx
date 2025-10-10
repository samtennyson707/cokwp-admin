import { AddUserModal } from '@/components/modal/add-user'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { supabase } from '@/services/supabase'
import type { TProfile } from '@/types/profile'
import { useEffect, useState } from 'react'

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

  function renderUsersData(users: TProfile[]) {
    return users.map((user) => (
      <Card key={user.id}>
        <CardTitle>{user.email}</CardTitle>
        <CardContent>
          <p>{user.first_name}</p>
          <p>{user.last_name}</p>
          <p>{user.avatar_url}</p>
          <p>{user.role}</p>
        </CardContent>
      </Card>
    ))
  }

  return (
    <>
      <h1>Dashboard</h1>
      <AddUserModal />

      {renderUsersData(users)}
    </>
  )
}