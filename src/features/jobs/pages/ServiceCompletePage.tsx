import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PageSkeleton } from '@/app/PageSkeleton'
import { NotFoundFallback } from '@/components/NotFoundFallback'
import { ServiceForm } from '../components/ServiceForm'
import { useOrder } from '@/features/orders/hooks/useOrders'
import { useGoBack } from '@/hooks/use-go-back'
import { canComplete } from '@/lib/business-rules'
import { ArrowLeft } from 'lucide-react'

export function ServiceCompletePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const goBack = useGoBack()
  const { data: order, isPending } = useOrder(id ?? '')

  if (isPending) return <PageSkeleton />

  if (!order) {
    return <NotFoundFallback backLabel="Back to jobs" />
  }

  const handleBackToDetail = async () => {
    try {
      await navigate(`/orders/${order.id}`)
    } catch (err) {
      console.error('[nav] back to detail failed', err)
    }
  }

  if (!canComplete(order.status)) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">This job cannot be completed in its current status.</p>
        <Button variant="link" onClick={handleBackToDetail}>
          Back to job detail
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Go back" onClick={goBack}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
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
