import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { ClipboardList, CheckCircle, Clock, DollarSign, type LucideIcon } from 'lucide-react'
import type { DashboardSummary } from '../hooks/useDashboard'

interface SummaryCardsProps {
  summary: DashboardSummary
}

const cards: {
  key: keyof DashboardSummary
  label: string
  icon: LucideIcon
  format?: (v: number) => string
}[] = [
  { key: 'total_orders', label: 'Total Orders', icon: ClipboardList },
  { key: 'completed_jobs', label: 'Completed Jobs', icon: CheckCircle },
  { key: 'pending_review', label: 'Pending Review', icon: Clock },
  { key: 'total_revenue', label: 'Total Revenue', icon: DollarSign, format: formatCurrency },
]

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.key}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <card.icon aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">{card.label}</p>
              <p className="text-lg font-semibold leading-tight tabular-nums">
                {(card.format ?? String)(summary[card.key])}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
