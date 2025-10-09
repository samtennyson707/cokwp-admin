export type ProfileState = {
    profile: any
    setProfile: (profile: any) => void,
    fetchProfile: (user: any) => Promise<void>,
}