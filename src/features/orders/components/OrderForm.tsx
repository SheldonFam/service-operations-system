import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField } from '@/components/ui/form-field'
import { SERVICE_TYPES } from '@/lib/constants'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCreateOrder, useTechnicians } from '../hooks/useOrders'
import { orderSchema } from '../schemas/order.schema'
import type { OrderFormValues } from '../schemas/order.schema'
import { toast } from 'sonner'

export function OrderForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createOrder } = useCreateOrder()
  const { technicians, loading: techLoading } = useTechnicians()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    mode: 'onBlur',
    defaultValues: {
      customer_name: '',
      phone: '',
      address: '',
      problem_description: '',
      service_type: 'Cleaning',
      quoted_price: undefined as unknown as number,
      assigned_technician: undefined,
      admin_notes: '',
    },
  })

  const onSubmit = async (values: OrderFormValues) => {
    if (!user) return
    const { data, error } = await createOrder(values, user.id)
    if (error) {
      toast.error(error)
      return
    }
    if (data) {
      toast.success(`Order ${data.order_no} created successfully`)
      navigate(`/orders/${data.id}/summary`)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={isSubmitting} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Customer Name" error={errors.customer_name?.message} required>
            {(fieldProps) => (
              <Input
                placeholder="e.g. Ahmad"
                {...register('customer_name')}
                {...fieldProps}
              />
            )}
          </FormField>

          <FormField label="Phone" error={errors.phone?.message} required>
            {(fieldProps) => (
              <Input
                placeholder="e.g. 0123456789"
                {...register('phone')}
                {...fieldProps}
              />
            )}
          </FormField>

          <FormField label="Address" error={errors.address?.message} className="md:col-span-2" required>
            {(fieldProps) => (
              <Textarea
                placeholder="Full address"
                {...register('address')}
                {...fieldProps}
              />
            )}
          </FormField>

          <FormField label="Problem Description" error={errors.problem_description?.message} className="md:col-span-2" required>
            {(fieldProps) => (
              <Textarea
                placeholder="Describe the issue"
                {...register('problem_description')}
                {...fieldProps}
              />
            )}
          </FormField>

          <FormField label="Service Type" error={errors.service_type?.message} required>
            {(fieldProps) => (
              <Controller
                name="service_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={fieldProps.id} aria-invalid={fieldProps['aria-invalid']}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>

          <FormField label="Quoted Price (RM)" error={errors.quoted_price?.message} required>
            {(fieldProps) => (
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('quoted_price', { valueAsNumber: true })}
                {...fieldProps}
              />
            )}
          </FormField>

          <FormField label="Assign Technician (Optional)">
            {(fieldProps) => (
              <Controller
                name="assigned_technician"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(v) => field.onChange(v || undefined)}
                    disabled={techLoading}
                  >
                    <SelectTrigger id={fieldProps.id}>
                      <SelectValue placeholder={techLoading ? 'Loading technicians...' : 'Select a technician'} />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>

          <FormField label="Admin Notes (Optional)" className="md:col-span-2">
            {(fieldProps) => (
              <Textarea
                placeholder="Internal notes"
                {...register('admin_notes')}
                {...fieldProps}
              />
            )}
          </FormField>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/orders')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Order'}
          </Button>
        </div>
      </fieldset>
    </form>
  )
}
