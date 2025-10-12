export type TQuiz = {
    id: string
    title: string
    description: string | null
    is_active: boolean
    created_at?: string
    updated_at?: string
    created_by?: {
        id: string
        first_name: string
        last_name: string
        email: string
    }
}

export type QuizCreateInput = {
    title: string
    description?: string | null
    is_active?: boolean
}

export type QuizUpdateInput = {
    title?: string
    description?: string | null
    is_active?: boolean
}


