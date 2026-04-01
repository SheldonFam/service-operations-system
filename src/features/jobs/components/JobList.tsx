import { Skeleton } from '@/components/ui/skeleton'
import { JobCard } from './JobCard'
import type { Order } from '@/lib/types'
import { ClipboardX } from 'lucide-react'

interface JobListProps {
  jobs: Order[]
  loading: boolean
}

export function JobList({ jobs, loading }: JobListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-muted-foreground">
        <ClipboardX className="mb-2 h-10 w-10" />
        <p>No jobs found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobCard key={job.id} order={job} />
      ))}
    </div>
  )
}
