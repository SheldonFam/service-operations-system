import { z } from 'zod'

export const postponeSchema = z.object({
  reason: z
    .string()
    .min(5, 'Provide at least 5 characters explaining the reason')
    .max(500, 'Reason must be under 500 characters'),
})

export type PostponeFormValues = z.infer<typeof postponeSchema>
