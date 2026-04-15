import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PageSkeleton } from '@/app/PageSkeleton'
import { NotFoundFallback } from '@/components/NotFoundFallback'
import { OrderDetail } from '../components/OrderDetail'
import { OrderActions } from '../components/OrderActions'
import { useOrder } from '../hooks/useOrders'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useGoBack } from '@/hooks/use-go-back'
import { generateWhatsAppUrl, buildJobDoneMessage } from '@/lib/utils'
import { isCompleted } from '@/lib/business-rules'
import { WhatsAppLinkButton } from '@/components/WhatsAppLinkButton'
import { ArrowLeft } from 'lucide-react'

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const goBack = useGoBack()
  const { role } = useAuth()
  const { data: order, isPending } = useOrder(id ?? '')

  if (isPending) return <PageSkeleton />

  if (!order) {
    return <NotFoundFallback />
  }

  const showWhatsApp = order.service_record && isCompleted(order.status)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Go back" onClick={goBack}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        </Button>
        <h1 className="min-w-0 flex-1 text-base font-semibold sm:text-2xl">{order.order_no}</h1>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {showWhatsApp && (
            <WhatsAppLinkButton
              label="WhatsApp"
              size="sm"
              url={generateWhatsAppUrl(
                order.phone,
                buildJobDoneMessage({
                  customerName: order.customer_name,
                  orderId: order.order_no,
                  technicianName: order.technician?.name ?? 'Technician',
                  completedAt: order.service_record!.completed_at ?? order.updated_at,
                }),
              )}
            />
          )}
          {role && <OrderActions order={order} userRole={role} />}
        </div>
      </div>

      <OrderDetail order={order} />
    </div>
  )
}
