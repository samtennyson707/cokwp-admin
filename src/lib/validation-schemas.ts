import { z } from 'zod'

export const loginFormSchema = z.object({
    email: z.email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
})


export const userRegistrationFormSchema = loginFormSchema.extend({
    first_name: z.string().min(1, { message: 'First name is required' }),
    last_name: z.string().min(1, { message: 'Last name is required' }),
})

export const quizFormSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string().optional(),
    is_active: z.boolean().default(true),
})