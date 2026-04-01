import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '../components/StatusBadge'
import { useOrder } from '../hooks/useOrders'
import { SERVICE_TYPE_COLORS } from '@/lib/constants'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'
import { CheckCircle2, PlusCircle, ClipboardList, Phone } from 'lucide-react'

export function OrderSummaryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { order, loading } = useOrder(id!)

  if (loading) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Order not found</p>
        <Button variant="link" onClick={() => navigate('/orders')}>
          Back to orders
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Success Header */}
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-semibold">Order Created!</h1>
        <p className="text-muted-foreground">
          Order <span className="font-medium text-foreground">{order.order_no}</span> has been submitted successfully.
        </p>
      </div>

      {/* Order Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Order Summary</CardTitle>
            <StatusBadge status={order.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order No</span>
              <span className="font-mono font-medium">{order.order_no}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{order.customer_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Phone</span>
              <a href={`tel:${order.phone}`} className="flex items-center gap-1 text-primary">
                <Phone className="h-3 w-3" />
                {order.phone}
              </a>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="shrink-0 text-muted-foreground">Address</span>
              <span className="text-right">{order.address}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Problem</span>
              <span className="text-right">{order.problem_description}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Service Type</span>
              <Badge variant="secondary" className={cn('text-xs', SERVICE_TYPE_COLORS[order.service_type])}>
                {order.service_type}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quoted Price</span>
              <span className="font-semibold text-primary">{formatCurrency(order.quoted_price)}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assigned Technician</span>
              <span className="font-medium">
                {order.technician?.name ?? <span className="text-muted-foreground">Not assigned</span>}
              </span>
            </div>
            {order.admin_notes && (
              <div className="flex items-start justify-between gap-4">
                <span className="shrink-0 text-muted-foreground">Admin Notes</span>
                <span className="text-right">{order.admin_notes}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created At</span>
              <span>{formatDateTime(order.created_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="flex-1 py-3 sm:py-0" size="lg" variant="outline" asChild>
          <Link to="/orders/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Another
          </Link>
        </Button>
        <Button className="flex-1 py-3 sm:py-0" size="lg" asChild>
          <Link to={`/orders/${order.id}`}>
            <ClipboardList className="mr-2 h-4 w-4" />
            View Order Detail
          </Link>
        </Button>
      </div>
    </div>
  )
}
