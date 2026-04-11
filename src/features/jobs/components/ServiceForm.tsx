import { useState } from 'react'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField } from '@/components/ui/form-field'
import { FileUpload } from './FileUpload'
import { useCompleteJob } from '../hooks/useJobs'
import { useUpload } from '../hooks/useUpload'
import { useManagers } from '@/features/orders/hooks/useOrders'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { serviceSchema } from '../schemas/service.schema'
import type { ServiceFormValues } from '../schemas/service.schema'
import type { Order, User as UserModel } from '@/lib/types'
import { PAYMENT_METHODS } from '@/lib/constants'
import { WhatsAppLinkButton, type WhatsAppLink } from '@/components/WhatsAppLinkButton'
import {
  formatCurrency,
  formatDateTime,
  generateWhatsAppUrl,
  buildJobDoneMessage,
  buildManagerNotifyMessage,
} from '@/lib/utils'
import { toast } from 'sonner'
import { User, Clock, CheckCircle2 } from 'lucide-react'

interface ServiceFormProps {
  order: Order
}

function buildNotifications(
  order: Order,
  technicianName: string,
  completedAt: string,
  managers: UserModel[],
): WhatsAppLink[] {
  const list: WhatsAppLink[] = []

  list.push({
    label: `Customer (${order.customer_name})`,
    url: generateWhatsAppUrl(
      order.phone,
      buildJobDoneMessage({
        customerName: order.customer_name,
        orderId: order.order_no,
        technicianName,
        completedAt,
      }),
    ),
  })

  for (const mgr of managers) {
    if (mgr.phone) {
      list.push({
        label: `Manager (${mgr.name})`,
        url: generateWhatsAppUrl(
          mgr.phone,
          buildManagerNotifyMessage({
            orderId: order.order_no,
            customerName: order.customer_name,
            technicianName,
            completedAt,
          }),
        ),
      })
    }
  }

  return list
}

export function ServiceForm({ order }: ServiceFormProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { completeJob } = useCompleteJob()
  const { uploadFiles, uploading, progress } = useUpload()
  // Prefetch managers when the form mounts so the success path doesn't add
  // a sequential round-trip after upload finishes.
  const { data: managers } = useManagers()
  const [files, setFiles] = useState<File[]>([])
  // The "completed at" timestamp is set at submission time, not mount time,
  // so the WhatsApp notification and DB record use the same accurate value.
  const [completedAt, setCompletedAt] = useState<string | null>(null)

  // After successful completion, render a panel of click-to-open WhatsApp
  // links instead of calling window.open in a loop. Real anchor clicks
  // preserve the user gesture so popup blockers don't fire.
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
    const { serviceRecordId, error } = await completeJob(order.id, user.id, {
      work_done: values.work_done,
      extra_charges: values.extra_charges,
      final_amount: order.quoted_price + values.extra_charges,
      completed_at: now,
      remarks: values.remarks,
      payment_amount: order.quoted_price + values.extra_charges,
      payment_method: values.payment_method,
    })

    if (error) {
      toast.error(error)
      return
    }

    if (serviceRecordId && files.length > 0) {
      const { error: uploadError } = await uploadFiles(serviceRecordId, files)
      if (uploadError) {
        // Photos failed but the service record + status update already
        // succeeded. Reverting the order status here would leave the service
        // record orphaned, so we keep the completion intact and let the user
        // retry uploads from the order detail page.
        toast.warning(
          `Job completed but photos failed to upload: ${uploadError}. ` +
          'You can view the order and retry from the detail page.',
        )
        // Still show the notifications panel so the user can notify the
        // customer / managers about the completion.
      }
    }

    setCompletedAt(now)
    const pending = buildNotifications(order, user.name, now, managers ?? [])

    toast.success('Job completed successfully!')
    setNotifications(pending)
  }

  if (notifications) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-emerald-600" />
            Job Completed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Send the WhatsApp notifications below. Each link opens in a new tab.
          </p>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recipients to notify.</p>
          ) : (
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li key={n.url}>
                  <WhatsAppLinkButton label={`Send to ${n.label}`} url={n.url} />
                </li>
              ))}
            </ul>
          )}
          <Button type="button" className="w-full" onClick={() => navigate('/orders')}>
            Done
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={isBusy} className="space-y-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Customer:</span> {order.customer_name}
            </p>
            <p>
              <span className="text-muted-foreground">Service:</span> {order.service_type}
            </p>
            <p>
              <span className="text-muted-foreground">Problem:</span> {order.problem_description}
            </p>
            <p>
              <span className="text-muted-foreground">Quoted Price:</span>{' '}
              <span className="font-medium">{formatCurrency(order.quoted_price)}</span>
            </p>
            <Separator className="my-2" />
            <div className="flex items-center gap-2">
              <User aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Technician:</span>{' '}
              <span className="font-medium">{user?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Timestamp:</span>{' '}
              <span className="font-medium">{completedAt ? formatDateTime(completedAt) : '—'}</span>
            </div>
          </CardContent>
        </Card>

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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    RM
                  </span>
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
