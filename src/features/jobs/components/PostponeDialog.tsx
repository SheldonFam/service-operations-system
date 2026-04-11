import { useForm } from 'react-hook-form'
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
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'
import { usePostponeJob } from '../hooks/useJobs'
import { postponeSchema } from '../schemas/postpone.schema'
import type { PostponeFormValues } from '../schemas/postpone.schema'
import type { Order } from '@/lib/types'
import { toast } from 'sonner'

interface PostponeDialogProps {
  order: Order
  open: boolean
  onClose: () => void
}

export function PostponeDialog({
  order,
  open,
  onClose,
}: PostponeDialogProps) {
  const { postponeJob } = usePostponeJob()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostponeFormValues>({
    resolver: zodResolver(postponeSchema),
    defaultValues: { reason: '' },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = async (values: PostponeFormValues) => {
    const { error } = await postponeJob(order.id, values.reason)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Job postponed')
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isSubmitting && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Postpone Job</DialogTitle>
          <DialogDescription>
            Provide a reason for postponing {order.order_no}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={isSubmitting} className="space-y-4">
            <FormField label="Reason" error={errors.reason?.message} required>
              {(fieldProps) => (
                <Textarea
                  autoFocus
                  placeholder="Why is this job being postponed?"
                  {...register('reason')}
                  {...fieldProps}
                />
              )}
            </FormField>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Postponing...' : 'Confirm Postpone'}
              </Button>
            </DialogFooter>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  )
}
