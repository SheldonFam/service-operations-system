import { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { JobList } from '../components/JobList'
import { useJobs } from '../hooks/useJobs'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { TAB_STATUSES, type JobTab } from '@/lib/business-rules'
import type { OrderStatus } from '@/lib/types'

// All statuses visible to technicians — excludes 'new' which only admins see.
const ALL_TECH_STATUSES: OrderStatus[] = [
  ...TAB_STATUSES.pending,
  ...TAB_STATUSES.in_progress,
  ...TAB_STATUSES.completed,
]

const TAB_LABELS: Record<JobTab, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
}

const TAB_STATUS_SETS: Record<JobTab, Set<OrderStatus>> = {
  pending: new Set(TAB_STATUSES.pending),
  in_progress: new Set(TAB_STATUSES.in_progress),
  completed: new Set(TAB_STATUSES.completed),
}

const TABS = Object.keys(TAB_LABELS) as JobTab[]

export function JobListPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<JobTab>('pending')
  const { data, isPending } = useJobs(user?.id ?? '', ALL_TECH_STATUSES)
  const jobs = data ?? []

  // Single pass: bucket each job into its tab and count.
  const { filteredJobs, counts } = useMemo(() => {
    const counts: Record<JobTab, number> = { pending: 0, in_progress: 0, completed: 0 }
    const filtered: typeof jobs = []
    const activeSet = TAB_STATUS_SETS[tab]
    for (const job of jobs) {
      for (const t of TABS) {
        if (TAB_STATUS_SETS[t].has(job.status)) {
          counts[t] += 1
          break
        }
      }
      if (activeSet.has(job.status)) filtered.push(job)
    }
    return { filteredJobs: filtered, counts }
  }, [jobs, tab])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">My Jobs</h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as JobTab)}>
        <TabsList className="w-full">
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t} className="flex-1 gap-1.5">
              {TAB_LABELS[t]}
              {counts[t] > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-[10px]">
                  {counts[t]}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab}>
          <JobList jobs={filteredJobs} loading={isPending} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
