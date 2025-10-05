import { supabase } from '../services/supabase'
import { useSessionStore } from '../store/session'

export default function Login() {
  const { setUser } = useSessionStore()

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (data) {
      setUser(data)
    }
    if (error) {
      console.error('Error logging in:', error)
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  )
}