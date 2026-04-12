import { z } from 'zod'
import { PAYMENT_METHODS } from '@/lib/constants'
import type { PaymentMethod } from '@/lib/types'

export const serviceSchema = z.object({
  work_done: z
    .string()
    .min(5, 'Describe at least 5 characters of work done')
    .max(2000, 'Description must be under 2000 characters'),
  extra_charges: z
    .number()
    // react-hook-form's `valueAsNumber` passes NaN when the input is cleared.
    // Coerce NaN → 0 so downstream math (final_amount) never receives NaN.
    .transform((v) => (Number.isFinite(v) ? v : 0))
    .pipe(z.number().min(0, 'Cannot be negative').max(50000, 'Extra charges must be under RM 50,000')),
  remarks: z.string().max(500, 'Remarks must be under 500 characters').optional(),
  payment_method: z.enum(PAYMENT_METHODS as [PaymentMethod, ...PaymentMethod[]], {
    message: 'Please select a payment method',
  }),
})

export type ServiceFormValues = z.infer<typeof serviceSchema>
