import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ServiceForm } from '../components/ServiceForm'
import { useOrder } from '@/features/orders/hooks/useOrders'
import { ArrowLeft } from 'lucide-react'

export function ServiceCompletePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { order, loading } = useOrder(id!)

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Order not found</p>
        <Button variant="link" onClick={() => navigate('/orders')}>
          Back to jobs
        </Button>
      </div>
    )
  }

  if (order.status !== 'in_progress') {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          This job cannot be completed in its current status.
        </p>
        <Button variant="link" onClick={() => navigate(`/orders/${order.id}`)}>
          Back to job detail
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Complete Job</h1>
          <p className="text-sm text-muted-foreground">{order.order_no}</p>
        </div>
      </div>

      <ServiceForm order={order} />
    </div>
  )
}
