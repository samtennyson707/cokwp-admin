import { z } from 'zod'

export const loginFormSchema = z.object({
    email: z.email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
})


export const userRegistrationFormSchema = loginFormSchema.extend({
    first_name: z.string().min(1, { message: 'First name is required' }),
    last_name: z.string().min(1, { message: 'Last name is required' }),
})

export const userUpdateFormSchema = z.object({
    first_name: z.string().min(1, { message: 'First name is required' }),
    last_name: z.string().min(1, { message: 'Last name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    phone: z.string().nullable().optional(),
    avatar_url: z.string().nullable().optional(),
})

export const quizFormSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string().optional(),
    is_active: z.boolean().default(true),
})

export const questionFormSchema = z.object({
    quiz_id: z.string().uuid({ message: 'Invalid quiz' }),
    question_text: z.string().min(1, { message: 'Question is required' }),
    options: z.array(z.string().min(1)).min(2).max(10),
    correct_answer: z.string().min(1),
}).refine((val) => val.options.includes(val.correct_answer), {
    message: 'Correct answer must be one of the options',
    path: ['correct_answer'],
})