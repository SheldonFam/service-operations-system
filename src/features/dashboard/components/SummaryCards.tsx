import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { ClipboardList, CheckCircle, Clock, DollarSign } from 'lucide-react'
import type { DashboardSummary } from '../hooks/useDashboard'

interface SummaryCardsProps {
  summary: DashboardSummary
}

const cards = [
  {
    key: 'total_orders' as const,
    label: 'Total Orders',
    icon: ClipboardList,
    format: (v: number) => String(v),
  },
  {
    key: 'completed_jobs' as const,
    label: 'Completed Jobs',
    icon: CheckCircle,
    format: (v: number) => String(v),
  },
  {
    key: 'pending_review' as const,
    label: 'Pending Review',
    icon: Clock,
    format: (v: number) => String(v),
  },
  {
    key: 'total_revenue' as const,
    label: 'Total Revenue',
    icon: DollarSign,
    format: (v: number) => formatCurrency(v),
  },
]

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.key}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <card.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                {card.label}
              </p>
              <p className="text-lg font-semibold leading-tight">
                {card.format(summary[card.key])}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
