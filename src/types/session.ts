export interface SessionState {
    user: any
    isAuthenticated: boolean
    setUser: (user: any) => void
    clearSession: () => void
    handleSignIn: (email: string, password: string) => Promise<void>
    handleSignOut: () => Promise<void>
    handleAdminRegistration: (email: string, password: string) => Promise<void>
}