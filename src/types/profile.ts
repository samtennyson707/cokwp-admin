export type ProfileState = {
    profile: TProfile
    setProfile: (profile: TProfile) => void,
    fetchProfile: (user: any) => Promise<void>,
}

export type TProfile = {
    id: string
    email: string
    first_name: string
    last_name: string
    avatar_url: string
    role: string
}