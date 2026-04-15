import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useUpdateOrder } from '../hooks/useOrders'
import { AssignTechDialog } from './AssignTechDialog'
import { PostponeDialog } from '@/features/jobs/components/PostponeDialog'
import type { Order, OrderStatus, UserRole } from '@/lib/types'
import {
  canAssign,
  canClose,
  canComplete,
  canReview,
  canStart,
  isReassignment,
  STATUS_AFTER_CLOSE,
  STATUS_AFTER_REVIEW,
  STATUS_AFTER_START,
} from '@/lib/business-rules'
import { toast } from 'sonner'
import { UserPlus, CheckCircle, XCircle, Play, Wrench, PauseCircle } from 'lucide-react'

interface OrderActionsProps {
  order: Order
  userRole: UserRole
}

export function OrderActions({ order, userRole }: OrderActionsProps) {
  const navigate = useNavigate()
  const updateOrderMutation = useUpdateOrder()
  const loading = updateOrderMutation.isPending
  const [assignOpen, setAssignOpen] = useState(false)
  const [postponeOpen, setPostponeOpen] = useState(false)
  const [activeAction, setActiveAction] = useState<string | null>(null)

  const handleStatusUpdate = async (newStatus: OrderStatus, successMsg: string) => {
    setActiveAction(newStatus)
    try {
      await updateOrderMutation.mutateAsync({ id: order.id, updates: { status: newStatus } })
      toast.success(successMsg)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setActiveAction(null)
    }
  }

  const showAssign = userRole === 'admin' && canAssign(order.status)
  const showClose = userRole === 'admin' && canClose(order.status)
  const showReview = userRole === 'manager' && canReview(order.status)
  const showStart = userRole === 'technician' && canStart(order.status)
  const showComplete = userRole === 'technician' && canComplete(order.status)

  if (!showAssign && !showClose && !showReview && !showStart && !showComplete) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {showAssign && (
        <>
          <Button onClick={() => setAssignOpen(true)}>
            <UserPlus aria-hidden="true" className="mr-2 h-4 w-4" />
            {isReassignment(order.status) ? 'Reassign' : 'Assign Technician'}
          </Button>
          <AssignTechDialog order={order} open={assignOpen} onClose={() => setAssignOpen(false)} />
        </>
      )}

      {showClose && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={loading && activeAction === STATUS_AFTER_CLOSE}>
              <XCircle aria-hidden="true" className="mr-2 h-4 w-4" />
              {loading && activeAction === STATUS_AFTER_CLOSE ? 'Closing\u2026' : 'Close Order'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Close this order?</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark order {order.order_no} as closed. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleStatusUpdate(STATUS_AFTER_CLOSE, 'Order closed successfully')}>
                Close Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {showReview && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={loading && activeAction === STATUS_AFTER_REVIEW}>
              <CheckCircle aria-hidden="true" className="mr-2 h-4 w-4" />
              {loading && activeAction === STATUS_AFTER_REVIEW ? 'Reviewing\u2026' : 'Mark as Reviewed'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark as reviewed?</AlertDialogTitle>
              <AlertDialogDescription>
                Confirm that you have reviewed the service record for order {order.order_no}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleStatusUpdate(STATUS_AFTER_REVIEW, 'Order marked as reviewed')}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {showStart && (
        <Button
          className="w-full sm:w-auto"
          size="lg"
          onClick={() => handleStatusUpdate(STATUS_AFTER_START, 'Job started!')}
          disabled={loading}
        >
          <Play aria-hidden="true" className="mr-2 h-4 w-4" />
          {loading && activeAction === STATUS_AFTER_START ? 'Starting\u2026' : 'Start Job'}
        </Button>
      )}

      {showComplete && (
        <>
          <div className="flex w-full gap-2">
            <Button className="flex-1" size="lg" onClick={() => navigate(`/orders/${order.id}/complete`)}>
              <Wrench aria-hidden="true" className="mr-2 h-4 w-4" />
              Complete Job
            </Button>
            <Button className="flex-1" variant="outline" size="lg" onClick={() => setPostponeOpen(true)}>
              <PauseCircle aria-hidden="true" className="mr-2 h-4 w-4" />
              Postpone
            </Button>
          </div>
          <PostponeDialog order={order} open={postponeOpen} onClose={() => setPostponeOpen(false)} />
        </>
      )}
    </div>
  )
}
