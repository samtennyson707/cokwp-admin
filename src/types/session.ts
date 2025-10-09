export interface SessionState {
    userSession: any
    isAuthenticated: boolean
    setSession: (session: any) => void
    clearSession: () => void
    handleSignIn: (email: string, password: string) => Promise<void>
    handleSignOut: () => Promise<void>
    handleAdminRegistration: (email: string, password: string) => Promise<void>
}