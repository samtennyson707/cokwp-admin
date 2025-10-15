import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { navigationLinks } from '@/constants/navigation'
import { useProfileStore } from '@/store/profile-store'

type Role = 'admin' | 'student'

/**
 * Dashboard page with role-based quick navigation buttons.
 */
export default function Dashboard() {
  const navigate = useNavigate()
  const { isAdmin } = useProfileStore()

  const role: Role = isAdmin ? 'admin' : 'student'

  const links = useMemo(() => {
    return navigationLinks
      .filter((item) => item.roles.includes(role) && item.href !== '/dashboard')
  }, [role])

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Quick actions</p>
      </div>
      {links.length === 0 ? (
        <p className="text-sm text-muted-foreground">No actions available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.href}
                variant="outline"
                size="lg"
                className="h-24 justify-start text-lg"
                onClick={() => navigate(item.href)}
              >
                <Icon className="mr-3 h-6 w-6" />
                {item.title}
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}
