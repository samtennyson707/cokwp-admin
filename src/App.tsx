import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import { supabase } from './services/supabase'
import { useSessionStore } from './store/session'
import Layout from './layout'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from 'sonner';
import { useProfileStore } from './store/profile-store'
import appRoutes from './constants/routes'

function App() {
  const { setSession } = useSessionStore()
  const navigate = useNavigate()

  const { fetchProfile } = useProfileStore()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session ?? null)
      if (event === 'SIGNED_IN' && session) {
        fetchProfile(session.user.id)
        navigate('/dashboard', { replace: true })
      }
      if (event === 'SIGNED_OUT') {
        navigate('/login', { replace: true })
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [navigate, setSession, fetchProfile])
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {appRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
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