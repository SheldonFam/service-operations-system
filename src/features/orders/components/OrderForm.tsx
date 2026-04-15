import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField } from '@/components/ui/form-field'
import { SERVICE_TYPES } from '@/lib/constants'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCreateOrder, useTechnicians } from '../hooks/useOrders'
import { orderSchema } from '../schemas/order.schema'
import type { OrderFormValues } from '../schemas/order.schema'
import { InlineError } from '@/components/InlineError'
import { toast } from 'sonner'
import type { User } from '@/lib/types'

export function OrderForm() {
  const { data: technicians, isPending: techLoading, error: techError } = useTechnicians()

  if (techLoading) {
    return (
      <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading form">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (techError || !technicians) {
    return (
      <InlineError
        message="Failed to load technician list. Please try again."
        onRetry={() => window.location.reload()}
      />
    )
  }

  return <OrderFormInner technicians={technicians} />
}

function OrderFormInner({ technicians }: { technicians: User[] }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const createOrderMutation = useCreateOrder()

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
      quoted_price: 0,
      assigned_technician: technicians[0]?.id ?? '',
      admin_notes: '',
    },
  })

  const onSubmit = async (values: OrderFormValues) => {
    if (!user) {
      toast.error('Session expired. Please sign in again.')
      return
    }
    try {
      const order = await createOrderMutation.mutateAsync({ values, createdBy: user.id })
      toast.success(`Order ${order.order_no} created successfully`)
      void navigate(`/orders/${order.id}/summary`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create order')
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={isSubmitting} className="space-y-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">Customer Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Customer Name" error={errors.customer_name?.message} required>
              {(fieldProps) => (
                <Input placeholder="e.g. Ahmad" autoComplete="name" {...register('customer_name')} {...fieldProps} />
              )}
            </FormField>

            <FormField label="Phone" error={errors.phone?.message} required>
              {(fieldProps) => (
                <Input
                  type="tel"
                  placeholder="e.g. 0123456789"
                  autoComplete="tel"
                  {...register('phone')}
                  {...fieldProps}
                />
              )}
            </FormField>
          </div>

          <FormField label="Address" error={errors.address?.message} required>
            {(fieldProps) => (
              <Textarea
                placeholder="Full address"
                autoComplete="street-address"
                {...register('address')}
                {...fieldProps}
              />
            )}
          </FormField>
        </div>

        <Separator />

        {/* Service Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">Service Details</h2>

          <FormField label="Problem Description" error={errors.problem_description?.message} required>
            {(fieldProps) => (
              <Textarea placeholder="Describe the issue" {...register('problem_description')} {...fieldProps} />
            )}
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Service Type" error={errors.service_type?.message} required>
              {(fieldProps) => (
                <Controller
                  name="service_type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={fieldProps.id} aria-invalid={fieldProps['aria-invalid']}>
                        <SelectValue placeholder="Select a service type" />
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
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">RM</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-10"
                    {...register('quoted_price', { valueAsNumber: true })}
                    {...fieldProps}
                  />
                </div>
              )}
            </FormField>

            <FormField label="Assign Technician">
              {(fieldProps) => (
                <Controller
                  name="assigned_technician"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={fieldProps.id}>
                        <SelectValue placeholder="Select a technician" />
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
          </div>

          <FormField label="Admin Notes">
            {(fieldProps) => <Textarea placeholder="Internal notes" {...register('admin_notes')} {...fieldProps} />}
          </FormField>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/orders')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating' : 'Create Order'}
          </Button>
        </div>
      </fieldset>
    </form>
  )
}
