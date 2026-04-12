import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/features/orders/components/StatusBadge'
import { SERVICE_TYPE_COLORS } from '@/lib/constants'
import type { JobListRow } from '@/lib/supabase-queries'
import { formatDate, cn } from '@/lib/utils'
import { MapPin, Clock } from 'lucide-react'

interface JobCardProps {
  order: JobListRow
}

export function JobCard({ order }: JobCardProps) {
  return (
    <Link
      to={`/orders/${order.id}`}
      aria-label={`Job ${order.order_no} — ${order.customer_name}`}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="transition-shadow hover:shadow-md">
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
            <Badge variant="secondary" className={cn('text-xs', SERVICE_TYPE_COLORS[order.service_type])}>
              {order.service_type}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
            <span className="truncate">{order.address}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock aria-hidden="true" className="h-3 w-3" />
            <span>{formatDate(order.created_at)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
