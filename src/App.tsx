import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { supabase } from './services/supabase'
import { useSessionStore } from './store/session'
import Layout from './layout'
import { ThemeProvider } from './components/theme-provider'
import QuizManagement from './pages/QuizManagement'
import UserManagement from './pages/UserManagement'
import { Toaster } from 'sonner';
import { useProfileStore } from './store/profile-store'

function App() {
  const userSession = useSessionStore((state) => state.userSession)
  const { setSession } = useSessionStore()
  const navigate = useNavigate()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('Auth state change:', session)
        setSession(session ?? null)
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
  }, [navigate])
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/quizzes" element={<QuizManagement />} />
          </Route>
        </Route>
      </Routes>
      <Toaster
        position="top-right"
        richColors
        expand
        visibleToasts={4}
        duration={4000}
      />
    </ThemeProvider>
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