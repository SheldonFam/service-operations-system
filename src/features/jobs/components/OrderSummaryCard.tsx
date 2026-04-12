import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { User, Clock } from 'lucide-react'

interface OrderSummaryCardProps {
  customerName: string
  serviceType: string
  problemDescription: string
  quotedPrice: number
  technicianName: string
  completedAt: string | null
}

export function OrderSummaryCard({
  customerName,
  serviceType,
  problemDescription,
  quotedPrice,
  technicianName,
  completedAt,
}: OrderSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p>
          <span className="text-muted-foreground">Customer:</span> {customerName}
        </p>
        <p>
          <span className="text-muted-foreground">Service:</span> {serviceType}
        </p>
        <p>
          <span className="text-muted-foreground">Problem:</span> {problemDescription}
        </p>
        <p>
          <span className="text-muted-foreground">Quoted Price:</span>{' '}
          <span className="font-medium">{formatCurrency(quotedPrice)}</span>
        </p>
        <Separator className="my-2" />
        <div className="flex items-center gap-2">
          <User aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Technician:</span>{' '}
          <span className="font-medium">{technicianName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Timestamp:</span>{' '}
          <span className="font-medium">{completedAt ? formatDateTime(completedAt) : '—'}</span>
        </div>
      </CardContent>
    </Card>
  )
}
