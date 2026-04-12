import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/app/lazy-pages'
import { NotFoundFallback } from '@/components/NotFoundFallback'
import { OrderDetail } from '../components/OrderDetail'
import { OrderActions } from '../components/OrderActions'
import { useOrder } from '../hooks/useOrders'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useGoBack } from '@/hooks/use-go-back'
import { generateWhatsAppUrl, buildJobDoneMessage } from '@/lib/utils'
import { isCompleted } from '@/lib/business-rules'
import type { Order } from '@/lib/types'
import { ArrowLeft, MessageCircle } from 'lucide-react'

function WhatsAppButton({ order }: { order: Order }) {
  if (!order.service_record || !isCompleted(order.status)) {
    return null
  }

  return (
    <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-50" asChild>
      <a
        href={generateWhatsAppUrl(
          order.phone,
          buildJobDoneMessage({
            customerName: order.customer_name,
            orderId: order.order_no,
            technicianName: order.technician?.name ?? 'Technician',
            completedAt: order.service_record.completed_at ?? order.updated_at,
          }),
        )}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" />
        WhatsApp
      </a>
    </Button>
  )
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const goBack = useGoBack()
  const { role } = useAuth()
  const { data: order, isPending } = useOrder(id ?? '')

  if (isPending) return <PageLoader />

  if (!order) {
    return <NotFoundFallback />
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Go back" onClick={goBack}>
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          </Button>
          <h1 className="min-w-0 flex-1 text-base font-semibold sm:text-2xl">{order.order_no}</h1>
          {/* Desktop: buttons inline with header */}
          <div className="hidden items-center gap-2 sm:flex">
            <WhatsAppButton order={order} />
            {role && <OrderActions order={order} userRole={role} />}
          </div>
        </div>
        {/* Mobile: buttons on second line */}
        <div className="flex flex-wrap items-center gap-2 sm:hidden">
          <WhatsAppButton order={order} />
          {role && <OrderActions order={order} userRole={role} />}
        </div>
      </div>

      <OrderDetail order={order} />
    </div>
  )
}
