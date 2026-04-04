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
import { useAuth } from '@/features/auth/hooks/useAuth'
import { serviceSchema } from '../schemas/service.schema'
import type { ServiceFormValues } from '../schemas/service.schema'
import type { Order } from '@/lib/types'
import { PAYMENT_METHODS } from '@/lib/constants'
import {
  formatCurrency,
  formatDateTime,
  generateWhatsAppUrl,
  buildJobDoneMessage,
  buildManagerNotifyMessage,
} from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { User, Clock } from 'lucide-react'

interface ServiceFormProps {
  order: Order
}

async function sendNotifications(order: Order, technicianName: string, completedAt: string) {
  const urls: string[] = []

  // WhatsApp notification to customer
  urls.push(
    generateWhatsAppUrl(
      order.phone,
      buildJobDoneMessage({
        customerName: order.customer_name,
        orderId: order.order_no,
        technicianName,
        completedAt,
      }),
    ),
  )

  // WhatsApp notifications to managers
  const { data: managers } = await supabase.from('users').select('phone').eq('role', 'manager')

  if (managers) {
    for (const mgr of managers) {
      if (mgr.phone) {
        urls.push(
          generateWhatsAppUrl(
            mgr.phone,
            buildManagerNotifyMessage({
              orderId: order.order_no,
              customerName: order.customer_name,
              technicianName,
              completedAt,
            }),
          ),
        )
      }
    }
  }

  // Open URLs sequentially with a small delay to avoid popup blocking
  for (let i = 0; i < urls.length; i++) {
    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
    window.open(urls[i], '_blank')
  }
}

export function ServiceForm({ order }: ServiceFormProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { completeJob } = useCompleteJob()
  const { uploadFiles, uploading, progress } = useUpload()
  const [files, setFiles] = useState<File[]>([])
  const [mountedAt] = useState(() => new Date().toISOString())

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

  const extraCharges = useWatch({ control, name: 'extra_charges' }) ?? 0
  const finalAmount = order.quoted_price + Number(extraCharges)
  const isBusy = isSubmitting || uploading

  const onSubmit = async (values: ServiceFormValues) => {
    if (!user) return

    const { serviceRecordId, error } = await completeJob(order.id, user.id, {
      work_done: values.work_done,
      extra_charges: values.extra_charges,
      final_amount: order.quoted_price + values.extra_charges,
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
        toast.error(`Photos failed to upload: ${uploadError}. You can re-upload later.`)
      }
    }

    const completedAt = new Date().toISOString()
    try {
      await sendNotifications(order, user.name, completedAt)
    } catch {
      toast.error('Failed to send some notifications')
    }

    toast.success('Job completed successfully!')
    navigate('/orders')
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
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Technician:</span>{' '}
              <span className="font-medium">{user?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Timestamp:</span>{' '}
              <span className="font-medium">{formatDateTime(mountedAt)}</span>
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
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register('extra_charges', { valueAsNumber: true })}
                  {...fieldProps}
                />
              )}
            </FormField>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Quoted Price</span>
              <span>{formatCurrency(order.quoted_price)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Extra Charges</span>
              <span>{formatCurrency(Number(extraCharges))}</span>
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
          {uploading ? `Uploading photos... ${progress}%` : isSubmitting ? 'Completing job...' : 'Complete Job'}
        </Button>
      </fieldset>
    </form>
  )
}
