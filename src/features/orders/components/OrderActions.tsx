import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useUpdateOrder } from '../hooks/useOrders'
import { AssignTechDialog } from './AssignTechDialog'
import { PostponeDialog } from '@/features/jobs/components/PostponeDialog'
import type { Order, UserRole } from '@/lib/types'
import { toast } from 'sonner'
import { UserPlus, CheckCircle, XCircle, Play, Wrench, PauseCircle } from 'lucide-react'

interface OrderActionsProps {
  order: Order
  userRole: UserRole
  onUpdated: () => void
}

export function OrderActions({
  order,
  userRole,
  onUpdated,
}: OrderActionsProps) {
  const navigate = useNavigate()
  const { updateOrder, loading } = useUpdateOrder()
  const [assignOpen, setAssignOpen] = useState(false)
  const [postponeOpen, setPostponeOpen] = useState(false)

  const handleStatusUpdate = async (
    newStatus: string,
    successMsg: string
  ) => {
    const { error } = await updateOrder(order.id, {
      status: newStatus as Order['status'],
    })
    if (error) {
      toast.error(error)
    } else {
      toast.success(successMsg)
      onUpdated()
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Admin: Assign/Reassign technician */}
      {userRole === 'admin' &&
        (order.status === 'new' || order.status === 'postponed') && (
          <>
            <Button onClick={() => setAssignOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              {order.status === 'postponed' ? 'Reassign' : 'Assign Technician'}
            </Button>
            <AssignTechDialog
              order={order}
              open={assignOpen}
              onClose={() => setAssignOpen(false)}
              onAssigned={onUpdated}
            />
          </>
        )}

      {/* Admin: Close Order */}
      {userRole === 'admin' && order.status === 'reviewed' && (
        <Button
          onClick={() =>
            handleStatusUpdate('closed', 'Order closed successfully')
          }
          disabled={loading}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Close Order
        </Button>
      )}

      {/* Manager: Mark as Reviewed */}
      {userRole === 'manager' && order.status === 'job_done' && (
        <Button
          onClick={() =>
            handleStatusUpdate('reviewed', 'Order marked as reviewed')
          }
          disabled={loading}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Mark as Reviewed
        </Button>
      )}

      {/* Technician: Start Job */}
      {userRole === 'technician' && order.status === 'assigned' && (
        <Button
          className="w-full"
          size="lg"
          onClick={() =>
            handleStatusUpdate('in_progress', 'Job started!')
          }
          disabled={loading}
        >
          <Play className="mr-2 h-4 w-4" />
          Start Job
        </Button>
      )}

      {/* Technician: Complete Job / Postpone */}
      {userRole === 'technician' && order.status === 'in_progress' && (
        <>
          <div className="flex w-full gap-2">
            <Button
              className="flex-1"
              size="lg"
              onClick={() => navigate(`/orders/${order.id}/complete`)}
            >
              <Wrench className="mr-2 h-4 w-4" />
              Complete Job
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setPostponeOpen(true)}
            >
              <PauseCircle className="mr-2 h-4 w-4" />
              Postpone
            </Button>
          </div>
          <PostponeDialog
            order={order}
            open={postponeOpen}
            onClose={() => setPostponeOpen(false)}
            onPostponed={onUpdated}
          />
        </>
      )}
    </div>
  )
}
