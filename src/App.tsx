import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { supabase } from './services/supabase'
import { useSessionStore } from './store/session'

function App() {
  const { setUser } = useSessionStore()
  const navigate = useNavigate()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session) {
          navigate('/dashboard')
        } else {
          navigate('/login')
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [setUser, navigate])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  )
}

export default AppWrapper