import type { ReactElement } from 'react'
import Dashboard from '@/pages/Dashboard'
import UserManagement from '@/pages/UserManagement'
import QuizManagement from '@/pages/QuizManagement'
import QuestionManagement from '@/pages/QuestionManagement'
import QuizDetail from '@/pages/QuizDetail'
import QuizAttempt from '@/pages/QuizAttempt'

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
  {
    path: '/quizzes/:id',
    element: <QuizDetail />,
    isProtected: true,
  },
  {
    path: '/quizzes/:id/attempt',
    element: <QuizAttempt />,
    isProtected: true,
  },
  {
    path: '/questions',
    element: <QuestionManagement />,
    isProtected: true,
  },
]

export default appRoutes


