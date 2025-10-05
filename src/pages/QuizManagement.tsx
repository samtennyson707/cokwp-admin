import { supabase } from '../services/supabase'
import { useSessionStore } from '../store/session'

export default function QuizManagement() {
  const { user, clearSession } = useSessionStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clearSession()
  }

  return (
    <div>
      <h1>QuizManagement</h1>
      <p>Welcome, {user?.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}