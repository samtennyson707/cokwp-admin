export type ProfileState = {
    profile: TProfile | null,
    setProfile: (profile: TProfile | null) => void,
    fetchProfile: (userId: string) => Promise<void>,
}

export type TProfile = {
    id: string
    email: string
    first_name: string
    last_name: string
    avatar_url: string
    role: string
}