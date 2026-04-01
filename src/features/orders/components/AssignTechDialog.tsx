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
import { toast } from 'sonner'

interface AssignTechDialogProps {
  order: Order
  open: boolean
  onClose: () => void
  onAssigned: () => void
}

export function AssignTechDialog({
  order,
  open,
  onClose,
  onAssigned,
}: AssignTechDialogProps) {
  const { technicians, loading: techLoading } = useTechnicians()
  const { updateOrder } = useUpdateOrder()

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
    onClose()
  }

  const onSubmit = async (values: AssignTechFormValues) => {
    const { error } = await updateOrder(order.id, {
      assigned_technician: values.technician_id,
      status: 'assigned',
      postpone_reason: null,
    })
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Technician assigned successfully')
    reset()
    onAssigned()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Technician</DialogTitle>
          <DialogDescription>
            Select a technician for order {order.order_no}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={isSubmitting} className="space-y-4">
            <FormField label="Technician" error={errors.technician_id?.message} required>
              {(fieldProps) => (
                <Controller
                  name="technician_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={techLoading}>
                      <SelectTrigger id={fieldProps.id} aria-invalid={fieldProps['aria-invalid']}>
                        <SelectValue placeholder={techLoading ? 'Loading...' : 'Select a technician'} />
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Assigning...' : 'Assign'}
              </Button>
            </DialogFooter>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  )
}
