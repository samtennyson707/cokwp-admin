import type { ReactElement } from 'react'
import Dashboard from '@/pages/Dashboard'
import UserManagement from '@/pages/UserManagement'
import QuizManagement from '@/pages/QuizManagement'

export interface AppRoute {
  path: string
  element: ReactElement
  isProtected: boolean
}

const appRoutes: readonly AppRoute[] = [
  {
    path: '/dashboard',
    element: <Dashboard />,
    isProtected: true,
  },
  {
    path: '/users',
    element: <UserManagement />,
    isProtected: true,
  },
  {
    path: '/quizzes',
    element: <QuizManagement />,
    isProtected: true,
  },
]

export default appRoutes


