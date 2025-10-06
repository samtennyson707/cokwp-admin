import { useSessionStore } from '../store/session'

export default function Dashboard() {
  const { user, handleSignOut } = useSessionStore()

  const handleLogout = async () => {
    await handleSignOut()
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}