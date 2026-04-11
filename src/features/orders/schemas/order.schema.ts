import { z } from 'zod'

const malaysianPhone = /^(\+?60|0)\d{8,10}$/

export const orderSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required').max(100, 'Name must be under 100 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(malaysianPhone, 'Enter a valid Malaysian phone number (e.g. 0123456789)'),
  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must be under 500 characters'),
  problem_description: z
    .string()
    .min(5, 'Provide at least 5 characters describing the problem')
    .max(1000, 'Description must be under 1000 characters'),
  service_type: z.enum(['Cleaning', 'Repair', 'Installation', 'Gas Refill', 'Inspection'], 'Select a service type'),
  quoted_price: z
    .number({ error: 'Price is required' })
    .positive('Price must be greater than 0')
    .max(100000, 'Price must be under RM 100,000'),
  assigned_technician: z.uuid('Invalid technician').optional(),
  admin_notes: z.string().max(500, 'Notes must be under 500 characters').optional(),
})

export type OrderFormValues = z.infer<typeof orderSchema>

export const assignTechSchema = z.object({
  technician_id: z.uuid('Please select a technician'),
})

export type AssignTechFormValues = z.infer<typeof assignTechSchema>
