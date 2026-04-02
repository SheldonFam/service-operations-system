import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export type DateRange = 'week' | 'month' | 'all'

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

interface RawOrder {
  id: string
  status: string
  quoted_price: number
  assigned_technician: string | null
  postpone_count: number
  created_at: string
  technician: { id: string; name: string } | null
  service_record: { final_amount: number }[] | null
}

function getDateFilter(range: DateRange): string | null {
  if (range === 'all') return null
  const now = new Date()
  if (range === 'week') {
    const start = new Date(now)
    start.setDate(now.getDate() - 7)
    return start.toISOString()
  }
  // month
  const start = new Date(now)
  start.setDate(now.getDate() - 30)
  return start.toISOString()
}

export function useDashboard(range: DateRange) {
  const [technicians, setTechnicians] = useState<TechnicianKPI[]>([])
  const [summary, setSummary] = useState<DashboardSummary>({
    total_orders: 0,
    completed_jobs: 0,
    pending_review: 0,
    total_revenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)

      let query = supabase
        .from('orders')
        .select(
          '*, technician:users!assigned_technician(id, name), service_record:service_records(final_amount)',
        )

      const dateFilter = getDateFilter(range)
      if (dateFilter) {
        query = query.gte('created_at', dateFilter)
      }

      const { data } = await query

      if (cancelled) return

      const orders = (data ?? []) as unknown as RawOrder[]

      // Summary
      const totalOrders = orders.length
      const completedJobs = orders.filter((o) =>
        ['job_done', 'reviewed', 'closed'].includes(o.status),
      ).length
      const pendingReview = orders.filter(
        (o) => o.status === 'job_done',
      ).length
      const totalRevenue = orders.reduce((sum, o) => {
        const records = o.service_record
        if (records && records.length > 0) {
          return sum + records[0].final_amount
        }
        return sum
      }, 0)

      setSummary({
        total_orders: totalOrders,
        completed_jobs: completedJobs,
        pending_review: pendingReview,
        total_revenue: totalRevenue,
      })

      // Per-technician aggregation
      const techMap = new Map<
        string,
        { name: string; jobs: number; amount: number; postpones: number }
      >()

      for (const order of orders) {
        if (!order.technician) continue
        const techId = order.technician.id
        const existing = techMap.get(techId) ?? {
          name: order.technician.name,
          jobs: 0,
          amount: 0,
          postpones: 0,
        }

        if (['job_done', 'reviewed', 'closed'].includes(order.status)) {
          existing.jobs += 1
          const records = order.service_record
          if (records && records.length > 0) {
            existing.amount += records[0].final_amount
          }
        }
        existing.postpones += order.postpone_count
        techMap.set(techId, existing)
      }

      const techKPIs: TechnicianKPI[] = Array.from(techMap.entries())
        .map(([id, data]) => ({
          id,
          name: data.name,
          jobs_completed: data.jobs,
          total_amount: data.amount,
          postpone_count: data.postpones,
        }))
        .sort((a, b) => b.jobs_completed - a.jobs_completed)

      setTechnicians(techKPIs)
      setLoading(false)
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [range, fetchKey])

  const refetch = useCallback(() => setFetchKey((k) => k + 1), [])

  return { technicians, summary, loading, refetch }
}
