import { supabase } from '../services/supabase'
import { useSessionStore } from '../store/session'

export default function Dashboard() {
  const { user, clearSession } = useSessionStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clearSession()
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}