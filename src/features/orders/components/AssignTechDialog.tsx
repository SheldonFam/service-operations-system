import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField } from '@/components/ui/form-field'
import { useTechnicians, useUpdateOrder } from '../hooks/useOrders'
import { assignTechSchema } from '../schemas/order.schema'
import type { AssignTechFormValues } from '../schemas/order.schema'
import type { Order } from '@/lib/types'
import { WhatsAppLinkButton, type WhatsAppLink } from '@/components/WhatsAppLinkButton'
import { generateWhatsAppUrl, buildAssignmentMessage } from '@/lib/utils'
import { STATUS_AFTER_ASSIGN } from '@/lib/business-rules'
import { toast } from 'sonner'

interface AssignTechDialogProps {
  order: Order
  open: boolean
  onClose: () => void
}

export function AssignTechDialog({
  order,
  open,
  onClose,
}: AssignTechDialogProps) {
  const { data: technicians, isPending: techLoading } = useTechnicians()
  const updateOrderMutation = useUpdateOrder()
  const [whatsappLink, setWhatsappLink] = useState<WhatsAppLink | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignTechFormValues>({
    resolver: zodResolver(assignTechSchema),
    defaultValues: {
      technician_id: order.assigned_technician ?? '',
    },
  })

  const handleClose = () => {
    reset()
    setWhatsappLink(null)
    onClose()
  }

  const onSubmit = async (values: AssignTechFormValues) => {
    try {
      await updateOrderMutation.mutateAsync({
        id: order.id,
        updates: {
          assigned_technician: values.technician_id,
          status: STATUS_AFTER_ASSIGN,
          postpone_reason: null,
        },
      })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to assign')
      return
    }
    const tech = technicians?.find((t) => t.id === values.technician_id)
    if (tech?.phone) {
      setWhatsappLink({
        label: `Send to ${tech.name}`,
        url: generateWhatsAppUrl(
          tech.phone,
          buildAssignmentMessage({
            technicianName: tech.name,
            orderId: order.order_no,
            customerName: order.customer_name,
            address: order.address,
            serviceType: order.service_type,
          }),
        ),
      })
    }
    toast.success('Technician assigned successfully')
    if (!tech?.phone) {
      handleClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isSubmitting && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{whatsappLink ? 'Technician Assigned' : 'Assign Technician'}</DialogTitle>
          <DialogDescription>
            {whatsappLink
              ? 'Notify the technician via WhatsApp.'
              : `Select a technician for order ${order.order_no}`}
          </DialogDescription>
        </DialogHeader>

        {whatsappLink ? (
          <div className="space-y-3">
            <WhatsAppLinkButton label={whatsappLink.label} url={whatsappLink.url} />
            <DialogFooter>
              <Button type="button" onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset disabled={isSubmitting} className="space-y-4">
              <FormField label="Technician" error={errors.technician_id?.message} required>
                {(fieldProps) => (
                  <Controller
                    name="technician_id"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} disabled={techLoading}>
                        <SelectTrigger
                          autoFocus
                          id={fieldProps.id}
                          aria-invalid={fieldProps['aria-invalid']}
                          aria-busy={techLoading || undefined}
                        >
                          <SelectValue placeholder={techLoading ? 'Loading\u2026' : 'Select a technician'} />
                        </SelectTrigger>
                        <SelectContent>
                          {(technicians ?? []).map((tech) => (
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Assigning\u2026' : 'Assign'}
                </Button>
              </DialogFooter>
            </fieldset>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
