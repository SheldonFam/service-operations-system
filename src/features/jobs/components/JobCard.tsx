import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/features/orders/components/StatusBadge'
import { SERVICE_TYPE_COLORS } from '@/lib/constants'
import type { Order } from '@/lib/types'
import { formatDate, cn } from '@/lib/utils'
import { MapPin, Clock } from 'lucide-react'

interface JobCardProps {
  order: Order
}

export function JobCard({ order }: JobCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => navigate(`/orders/${order.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{order.customer_name}</CardTitle>
            <p className="text-xs text-muted-foreground">{order.order_no}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn('text-xs', SERVICE_TYPE_COLORS[order.service_type])}
          >
            {order.service_type}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{order.address}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatDate(order.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
