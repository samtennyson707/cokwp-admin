import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { TProfile } from '@/types/profile'
import { fetchProfileById } from '@/services/profiles'
import { supabase } from '@/services/supabase'
import { showErrorToast } from '@/lib/toast-util'
import EditUserModal from '@/components/modal/edit-user'
import DeleteUserModal from '@/components/modal/delete-user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, Phone, Shield, User } from 'lucide-react'

export default function UserDetail() {
  const params = useParams()
  const userId = useMemo(() => params.id ?? '', [params])
  const navigate = useNavigate()
  const [user, setUser] = useState<TProfile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!userId) return
    async function loadData(): Promise<void> {
      try {
        setIsLoading(true)
        const userData = await fetchProfileById(userId)
        setUser(userData)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load user'
        showErrorToast(message)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [userId])

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`user-detail-${userId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, (payload) => {
        setUser(payload.new as TProfile)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, () => {
        navigate('/users')
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, navigate])

  function handleUserUpdated(updated: TProfile): void {
    setUser(updated)
  }

  function handleUserDeleted(): void {
    navigate('/users')
  }

  function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (!userId) return <div className="w-full">Missing user identifier.</div>

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="space-y-1">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="h-96 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-3">
            <div className="h-32 bg-muted animate-pulse rounded" />
            <div className="h-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="w-full space-y-6">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            Back
          </button>
          <h1 className="text-2xl font-semibold tracking-tight">User not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Back
        </button>
        <h1 className="text-2xl font-semibold tracking-tight">User Profile</h1>
        <p className="text-sm text-muted-foreground">View and manage user information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar_url ?? undefined} alt={`${user.first_name} ${user.last_name}`} />
                    <AvatarFallback className="text-lg">{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{user.first_name} {user.last_name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Full Name</p>
                    <p className="text-sm text-muted-foreground">{user.first_name} {user.last_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Email Address</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Phone Number</p>
                    <p className="text-sm text-muted-foreground">{user.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50">
                  <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Role</p>
                    <p className="text-sm text-muted-foreground">
                      {user.isAdmin ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                          User
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">User ID</span>
                  <span className="text-sm font-mono">{user.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Avatar URL</span>
                  <span className="text-sm text-right truncate max-w-xs">{user.avatar_url || 'Not set'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex md:flex-row flex-col gap-2">
              <EditUserModal user={user} onUpdated={handleUserUpdated} />
              <DeleteUserModal user={user} onDeleted={handleUserDeleted} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

