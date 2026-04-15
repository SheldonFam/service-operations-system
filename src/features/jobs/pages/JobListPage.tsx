import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { JobList } from '../components/JobList'
import { useJobs } from '../hooks/useJobs'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { TAB_STATUSES, type JobTab } from '@/lib/business-rules'
import type { OrderStatus } from '@/lib/types'

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

const TABS = Object.keys(TAB_LABELS) as JobTab[]

function jobsForTab<T extends { status: OrderStatus }>(jobs: T[], tab: JobTab): T[] {
  return jobs.filter((j) => TAB_STATUSES[tab].includes(j.status))
}

export function JobListPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<JobTab>('pending')
  const { data, isPending } = useJobs(user?.id ?? '', ALL_TECH_STATUSES)

  const jobs = data ?? []
  const filteredJobs = jobsForTab(jobs, tab)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">My Jobs</h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as JobTab)}>
        <TabsList className="w-full">
          {TABS.map((t) => {
            const count = jobsForTab(jobs, t).length
            return (
              <TabsTrigger key={t} value={t} className="flex-1 gap-1.5">
                {TAB_LABELS[t]}
                {count > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-[10px]">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value={tab}>
          <JobList jobs={filteredJobs} loading={isPending} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
