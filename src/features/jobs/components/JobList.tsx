import { Skeleton } from '@/components/ui/skeleton'
import { JobCard } from './JobCard'
import type { JobListRow } from '@/lib/supabase-queries'
import { ClipboardX } from 'lucide-react'

interface JobListProps {
  jobs: JobListRow[]
  loading: boolean
}

export function JobList({ jobs, loading }: JobListProps) {
  if (loading) {
    return (
      <div className="space-y-3" role="status" aria-busy="true" aria-label="Loading jobs">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-muted-foreground">
        <ClipboardX aria-hidden="true" className="mb-2 h-10 w-10" />
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
