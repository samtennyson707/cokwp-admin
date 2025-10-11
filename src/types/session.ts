export interface SessionState {
    userSession: any
    isAuthenticated: boolean
    setSession: (session: any) => void
    clearSession: () => void
    handleSignIn: (email: string, password: string) => Promise<void>
    handleSignOut: () => Promise<void>
    handleAdminRegistration: (email: string, password: string) => Promise<void>
    handleUserRegistration: (email: string, password: string, first_name: string, last_name: string) => Promise<void>
}