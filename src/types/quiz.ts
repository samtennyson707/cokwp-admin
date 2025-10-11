export type TQuiz = {
    id: string
    title: string
    description: string | null
    created_by: string
    is_active: boolean
    created_at?: string
    updated_at?: string
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


