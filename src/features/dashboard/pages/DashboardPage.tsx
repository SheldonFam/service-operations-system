import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { SummaryCards } from '../components/SummaryCards'
import { TechnicianLeaderboard } from '../components/TechnicianLeaderboard'
import { JobsChart } from '../components/JobsChart'
import { useDashboard } from '../hooks/useDashboard'
import type { DateRange } from '../hooks/useDashboard'
import { cn } from '@/lib/utils'

const ranges: { value: DateRange; label: string }[] = [
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
]

export function DashboardPage() {
  const [range, setRange] = useState<DateRange>('week')
  const { technicians, summary, loading } = useDashboard(range)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Technician performance metrics
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border p-1">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                'cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                range === r.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      ) : (
        <>
          <SummaryCards summary={summary} />
          <div className="grid gap-6 lg:grid-cols-2">
            <JobsChart technicians={technicians} />
            <TechnicianLeaderboard technicians={technicians} />
          </div>
        </>
      )}
    </div>
  )
}
