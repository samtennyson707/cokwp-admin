import { Navigate, Outlet } from 'react-router-dom'
import { useSessionStore } from '../store/session'

export default function ProtectedRoute() {
  const { isAuthenticated } = useSessionStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return <Outlet />
}