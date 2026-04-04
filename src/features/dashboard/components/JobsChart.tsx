import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TechnicianKPI } from '../hooks/useDashboard'

interface JobsChartProps {
  technicians: TechnicianKPI[]
}

export function JobsChart({ technicians }: JobsChartProps) {
  const maxJobs = Math.max(...technicians.map((t) => t.jobs_completed), 1)

  if (technicians.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Jobs Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No data available for this period.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Jobs Completed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {technicians.map((tech) => {
          const pct = (tech.jobs_completed / maxJobs) * 100
          return (
            <div key={tech.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate font-medium">{tech.name}</span>
                <span className="shrink-0 text-muted-foreground">
                  {tech.jobs_completed}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
