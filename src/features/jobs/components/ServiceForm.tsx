import { useState } from 'react'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField } from '@/components/ui/form-field'
import { FileUpload } from './FileUpload'
import { CompletionNotifications } from './CompletionNotifications'
import { OrderSummaryCard } from './OrderSummaryCard'
import { useCompleteJob } from '../hooks/useJobs'
import { useUpload } from '../hooks/useUpload'
import { useManagers } from '@/features/orders/hooks/useOrders'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { serviceSchema } from '../schemas/service.schema'
import type { ServiceFormValues } from '../schemas/service.schema'
import type { Order } from '@/lib/types'
import { PAYMENT_METHODS } from '@/lib/constants'
import type { WhatsAppLink } from '@/components/WhatsAppLinkButton'
import { formatCurrency, buildNotificationLinks } from '@/lib/utils'
import { toast } from 'sonner'

interface ServiceFormProps {
  order: Order
}

export function ServiceForm({ order }: ServiceFormProps) {
  const { user } = useAuth()
  const completeJobMutation = useCompleteJob()
  const { uploadFiles, uploading, progress } = useUpload()
  const { data: managers } = useManagers()
  const [files, setFiles] = useState<File[]>([])
  const [completedAt, setCompletedAt] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<WhatsAppLink[] | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    mode: 'onBlur',
    defaultValues: {
      work_done: '',
      extra_charges: 0,
      remarks: '',
      payment_method: undefined,
    },
  })

  const extraCharges = useWatch({ control, name: 'extra_charges' }) || 0
  const finalAmount = order.quoted_price + extraCharges
  const isBusy = isSubmitting || uploading

  const onSubmit = async (values: ServiceFormValues) => {
    if (!user) return

    const now = new Date().toISOString()
    let serviceRecordId: string | null = null
    try {
      const result = await completeJobMutation.mutateAsync({
        orderId: order.id,
        technicianId: user.id,
        data: {
          work_done: values.work_done,
          extra_charges: values.extra_charges,
          final_amount: order.quoted_price + values.extra_charges,
          completed_at: now,
          remarks: values.remarks,
          payment_amount: order.quoted_price + values.extra_charges,
          payment_method: values.payment_method,
        },
      })
      serviceRecordId = result.serviceRecordId
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to complete job')
      return
    }

    if (serviceRecordId && files.length > 0) {
      const { error: uploadError } = await uploadFiles({ serviceRecordId, files })
      if (uploadError) {
        toast.warning(
          `Job completed but photos failed to upload: ${uploadError}. ` +
            'You can view the order and retry from the detail page.',
        )
      }
    }

    setCompletedAt(now)
    const pending = buildNotificationLinks(order, user.name, now, managers ?? [])
    toast.success('Job completed successfully!')
    setNotifications(pending)
  }

  if (notifications) {
    return <CompletionNotifications notifications={notifications} />
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={isBusy} className="space-y-6">
        <OrderSummaryCard
          customerName={order.customer_name}
          serviceType={order.service_type}
          problemDescription={order.problem_description}
          quotedPrice={order.quoted_price}
          technicianName={user?.name ?? ''}
          completedAt={completedAt}
        />

        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Work Done" error={errors.work_done?.message} required>
              {(fieldProps) => (
                <Textarea
                  placeholder="Describe the work performed..."
                  rows={4}
                  {...register('work_done')}
                  {...fieldProps}
                />
              )}
            </FormField>

            <FormField label="Extra Charges (RM)" error={errors.extra_charges?.message}>
              {(fieldProps) => (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">RM</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-10"
                    {...register('extra_charges', { valueAsNumber: true })}
                    {...fieldProps}
                  />
                </div>
              )}
            </FormField>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Quoted Price</span>
              <span>{formatCurrency(order.quoted_price)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Extra Charges</span>
              <span>{formatCurrency(extraCharges)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="font-medium">Final Amount</span>
              <span className="text-lg font-semibold text-primary">{formatCurrency(finalAmount)}</span>
            </div>

            <FormField label="Remarks">
              {(fieldProps) => (
                <Textarea placeholder="Any additional notes..." {...register('remarks')} {...fieldProps} />
              )}
            </FormField>
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Payment Method" error={errors.payment_method?.message}>
              {(fieldProps) => (
                <Controller
                  name="payment_method"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={fieldProps.id}>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </FormField>

            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-sm text-muted-foreground">Payment Amount</span>
              <span className="font-semibold text-primary">{formatCurrency(finalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Service Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload files={files} onFilesChange={setFiles} />
          </CardContent>
        </Card>

        {/* Submit */}
        <Button type="submit" className="w-full" size="lg" disabled={isBusy}>
          {uploading ? `Uploading photos\u2026 ${progress}%` : isSubmitting ? 'Completing job\u2026' : 'Complete Job'}
        </Button>
      </fieldset>
    </form>
  )
}
