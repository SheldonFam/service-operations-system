import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FormField } from '@/components/ui/form-field'
import { FileUpload } from './FileUpload'
import { useCompleteJob } from '../hooks/useJobs'
import { useUpload } from '../hooks/useUpload'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { serviceSchema } from '../schemas/service.schema'
import type { ServiceFormValues } from '../schemas/service.schema'
import type { Order } from '@/lib/types'
import { formatCurrency, formatDateTime, generateWhatsAppUrl, buildJobDoneMessage, buildManagerNotifyMessage } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { User, Clock } from 'lucide-react'

interface ServiceFormProps {
  order: Order
}

export function ServiceForm({ order }: ServiceFormProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { completeJob } = useCompleteJob()
  const { uploadFiles, uploading, progress } = useUpload()
  const [files, setFiles] = useState<File[]>([])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    mode: 'onBlur',
    defaultValues: {
      work_done: '',
      extra_charges: 0,
      remarks: '',
    },
  })

  const extraCharges = watch('extra_charges') ?? 0
  const finalAmount = order.quoted_price + Number(extraCharges)
  const isBusy = isSubmitting || uploading
  // Fix #8: Recompute timestamp each render so it stays current
  // while the user fills the form, rather than freezing at mount time
  const now = useMemo(() => new Date().toISOString(), [isSubmitting])

  const onSubmit = async (values: ServiceFormValues) => {
    if (!user) return

    const { serviceRecordId, error } = await completeJob(
      order.id,
      user.id,
      {
        work_done: values.work_done,
        extra_charges: values.extra_charges,
        final_amount: order.quoted_price + values.extra_charges,
        remarks: values.remarks,
      }
    )

    if (error) {
      toast.error(error)
      return
    }

    if (serviceRecordId && files.length > 0) {
      const { error: uploadError } = await uploadFiles(serviceRecordId, files)
      if (uploadError) {
        toast.error(uploadError)
      }
    }

    const completedAt = new Date().toISOString()

    // Module 3: WhatsApp notification to customer on Job Done
    const whatsappUrl = generateWhatsAppUrl(
      order.phone,
      buildJobDoneMessage({
        customerName: order.customer_name,
        orderId: order.order_no,
        technicianName: user.name,
        completedAt,
      }),
    )
    window.open(whatsappUrl, '_blank')

    // Module 2 Bonus: Notify manager via WhatsApp when job completed
    const { data: managers } = await supabase
      .from('users')
      .select('phone')
      .eq('role', 'manager')
    if (managers) {
      for (const mgr of managers) {
        if (mgr.phone) {
          const mgrUrl = generateWhatsAppUrl(
            mgr.phone,
            buildManagerNotifyMessage({
              orderId: order.order_no,
              customerName: order.customer_name,
              technicianName: user.name,
              completedAt,
            }),
          )
          window.open(mgrUrl, '_blank')
        }
      }
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
              <span className="text-muted-foreground">Customer:</span>{' '}
              {order.customer_name}
            </p>
            <p>
              <span className="text-muted-foreground">Service:</span>{' '}
              {order.service_type}
            </p>
            <p>
              <span className="text-muted-foreground">Problem:</span>{' '}
              {order.problem_description}
            </p>
            <p>
              <span className="text-muted-foreground">Quoted Price:</span>{' '}
              <span className="font-medium">
                {formatCurrency(order.quoted_price)}
              </span>
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
              <span className="font-medium">{formatDateTime(now)}</span>
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
              <span className="text-lg font-semibold text-primary">
                {formatCurrency(finalAmount)}
              </span>
            </div>

            <FormField label="Remarks">
              {(fieldProps) => (
                <Textarea
                  placeholder="Any additional notes..."
                  {...register('remarks')}
                  {...fieldProps}
                />
              )}
            </FormField>
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
          {uploading
            ? `Uploading photos... ${progress}%`
            : isSubmitting
              ? 'Completing job...'
              : 'Complete Job'}
        </Button>
      </fieldset>
    </form>
  )
}
