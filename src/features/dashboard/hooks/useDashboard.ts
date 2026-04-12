import { useQuery } from '@tanstack/react-query'
import { listOrdersForDashboard, type DashboardOrderRow } from '@/lib/supabase-queries'
import { isCompleted, isPendingReview } from '@/lib/business-rules'
import { getDateFilter, type DateRange } from '@/lib/date-window'

export type { DateRange } from '@/lib/date-window'

export interface TechnicianKPI {
  id: string
  name: string
  jobs_completed: number
  total_amount: number
  postpone_count: number
}

export interface DashboardSummary {
  total_orders: number
  completed_jobs: number
  pending_review: number
  total_revenue: number
}

export interface DashboardData {
  summary: DashboardSummary
  technicians: TechnicianKPI[]
}

function aggregate(orders: DashboardOrderRow[]): DashboardData {
  let completedJobs = 0
  let pendingReview = 0
  let totalRevenue = 0

  const techMap = new Map<string, { name: string; jobs: number; amount: number; postpones: number }>()

  for (const order of orders) {
    const completed = isCompleted(order.status)
    const records = order.service_record
    const recordAmount = records && records.length > 0 ? records[0].final_amount : 0

    if (completed) {
      completedJobs += 1
      totalRevenue += recordAmount
    }
    if (isPendingReview(order.status)) pendingReview += 1

    if (!order.technician) continue
    const techId = order.technician.id
    const existing = techMap.get(techId) ?? {
      name: order.technician.name,
      jobs: 0,
      amount: 0,
      postpones: 0,
    }
    if (completed) {
      existing.jobs += 1
      existing.amount += recordAmount
    }
    existing.postpones += order.postpone_count
    techMap.set(techId, existing)
  }

  const technicians: TechnicianKPI[] = Array.from(techMap.entries())
    .map(([id, data]) => ({
      id,
      name: data.name,
      jobs_completed: data.jobs,
      total_amount: data.amount,
      postpone_count: data.postpones,
    }))
    .sort((a, b) => b.jobs_completed - a.jobs_completed)

  return {
    summary: {
      total_orders: orders.length,
      completed_jobs: completedJobs,
      pending_review: pendingReview,
      total_revenue: totalRevenue,
    },
    technicians,
  }
}

export function useDashboard(range: DateRange) {
  return useQuery({
    queryKey: ['dashboard', range],
    queryFn: async ({ signal }) => {
      const { data, error } = await listOrdersForDashboard(getDateFilter(range), signal)
      if (error) throw new Error(error)
      return data ?? []
    },
    select: aggregate,
    staleTime: 60_000,
  })
}
