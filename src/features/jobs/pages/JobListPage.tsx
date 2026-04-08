import { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { JobList } from '../components/JobList'
import { useJobs } from '../hooks/useJobs'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { OrderStatus } from '@/lib/types'

type JobTab = 'pending' | 'in_progress' | 'completed'

const TAB_STATUSES: Record<JobTab, OrderStatus[]> = {
  pending: ['assigned'],
  in_progress: ['in_progress', 'postponed'],
  completed: ['job_done', 'reviewed', 'closed'],
}

export function JobListPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<JobTab>('pending')
  const { jobs, loading } = useJobs(user?.id ?? '')

  const filteredJobs = useMemo(() => {
    const statuses = TAB_STATUSES[tab]
    return jobs.filter((j) => statuses.includes(j.status))
  }, [jobs, tab])

  const counts = {
    pending: jobs.filter((j) => TAB_STATUSES.pending.includes(j.status)).length,
    in_progress: jobs.filter((j) => TAB_STATUSES.in_progress.includes(j.status)).length,
    completed: jobs.filter((j) => TAB_STATUSES.completed.includes(j.status)).length,
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">My Jobs</h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as JobTab)}>
        <TabsList className="w-full">
          <TabsTrigger value="pending" className="flex-1 gap-1.5">
            Pending
            {counts.pending > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-[10px]">
                {counts.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="flex-1 gap-1.5">
            In Progress
            {counts.in_progress > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-[10px]">
                {counts.in_progress}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 gap-1.5">
            Completed
            {counts.completed > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-[10px]">
                {counts.completed}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <JobList jobs={filteredJobs} loading={loading} />
        </TabsContent>
        <TabsContent value="in_progress">
          <JobList jobs={filteredJobs} loading={loading} />
        </TabsContent>
        <TabsContent value="completed">
          <JobList jobs={filteredJobs} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
