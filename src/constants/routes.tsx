import type { ReactElement } from 'react'
import Dashboard from '@/pages/Dashboard'
import UserManagement from '@/pages/UserManagement'
import UserDetail from '@/pages/UserDetail'
import QuizManagement from '@/pages/QuizManagement'
import QuestionManagement from '@/pages/QuestionManagement'
import QuizDetail from '@/pages/QuizDetail'
import QuizAttempt from '@/pages/QuizAttempt'
import QuizResults from '@/pages/QuizResults'
import QuizAttemptDetail from '@/pages/QuizAttemptDetail'

export interface AppRoute {
  path: string
  element: ReactElement
  isProtected: boolean
  allowRoles: string[]
}

const appRoutes: readonly AppRoute[] = [
  {
    path: '/dashboard',
    element: <Dashboard />,
    isProtected: true,
    allowRoles: ['admin', 'student'],
  },
  {
    path: '/users',
    element: <UserManagement />,
    isProtected: true,
    allowRoles: ['admin'],
  },
  {
    path: '/users/:id',
    element: <UserDetail />,
    isProtected: true,
    allowRoles: ['admin'],
  },
  {
    path: '/quizzes',
    element: <QuizManagement />,
    isProtected: true,
    allowRoles: ['admin', 'student'],
  },
  {
    path: '/quizzes/:id',
    element: <QuizDetail />,
    isProtected: true,
    allowRoles: ['admin', 'student'],
  },
  {
    path: '/quizzes/:id/attempt',
    element: <QuizAttempt />,
    isProtected: true,
    allowRoles: ['student'],
  },
  {
    path: '/questions',
    element: <QuestionManagement />,
    isProtected: true,
    allowRoles: ['admin'],
  },
  {
    path: '/results',
    element: <QuizResults />,
    isProtected: true,
    allowRoles: ['admin', 'student'],
  },
  {
    path: '/results/:attemptId',
    element: <QuizAttemptDetail />,
    isProtected: true,
    allowRoles: ['admin', 'student'],
  },
]

export default appRoutes


