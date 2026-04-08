import { z } from 'zod'

export const serviceSchema = z.object({
  work_done: z
    .string()
    .min(5, 'Describe at least 5 characters of work done')
    .max(2000, 'Description must be under 2000 characters'),
  extra_charges: z.number().min(0, 'Cannot be negative').max(50000, 'Extra charges must be under RM 50,000'),
  remarks: z.string().max(500, 'Remarks must be under 500 characters').optional(),
  payment_method: z.enum(['Cash', 'Bank Transfer', 'Card', 'E-Wallet'], {
    message: 'Please select a payment method',
  }),
})

export type ServiceFormValues = z.infer<typeof serviceSchema>
