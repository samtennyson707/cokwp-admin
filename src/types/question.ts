export type TQuestion = {
    id: string
    quiz_id: string
    question_text: string
    options: readonly string[]
    correct_answer: string
    created_at?: string
}

export type QuestionCreateInput = {
    quiz_id: string
    question_text: string
    options: readonly string[]
    correct_answer: string
}

export type QuestionUpdateInput = {
    question_text?: string
    options?: readonly string[]
    correct_answer?: string
}


