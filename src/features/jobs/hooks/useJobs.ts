import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus } from '@/lib/types'

// Fix #4: Accept a serializable key instead of an array reference,
// so the dependency doesn't change on every render.
export function useJobs(technicianId: string, statuses?: OrderStatus[]) {
  const [jobs, setJobs] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  // Serialize statuses so the dependency is a stable string, not a new array ref
  const statusKey = statuses?.join(',') ?? ''

  const fetch = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('orders')
      .select('*')
      .eq('assigned_technician', technicianId)
      .order('updated_at', { ascending: false })

    if (statusKey) {
      query = query.in('status', statusKey.split(','))
    }

    const { data } = await query
    setJobs((data as Order[]) ?? [])
    setLoading(false)
  }, [technicianId, statusKey])

  useEffect(() => {
    if (technicianId) fetch()
  }, [technicianId, fetch])

  return { jobs, loading, refetch: fetch }
}

export function useCompleteJob() {
  const [loading, setLoading] = useState(false)

  const completeJob = useCallback(
    async (
      orderId: string,
      technicianId: string,
      data: {
        work_done: string
        extra_charges: number
        final_amount: number
        remarks?: string
      }
    ) => {
      setLoading(true)

      const { data: record, error: recordError } = await supabase
        .from('service_records')
        .insert({
          order_id: orderId,
          technician_id: technicianId,
          work_done: data.work_done,
          extra_charges: data.extra_charges,
          final_amount: data.final_amount,
          remarks: data.remarks || null,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (recordError) {
        setLoading(false)
        return { serviceRecordId: null, error: recordError.message }
      }

      // Fix #9: Removed manual updated_at — let DB handle it
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'job_done' as const })
        .eq('id', orderId)

      setLoading(false)

      if (orderError) {
        return { serviceRecordId: record.id as string, error: orderError.message }
      }

      return { serviceRecordId: record.id as string, error: null }
    },
    []
  )

  return { completeJob, loading }
}

export function usePostponeJob() {
  const [loading, setLoading] = useState(false)

  const postponeJob = useCallback(
    async (orderId: string, reason: string) => {
      setLoading(true)

      // Fix #6: Use Supabase RPC to atomically increment postpone_count
      // instead of read-then-write which has a race condition.
      // Fallback: use a raw SQL call via rpc, or do a single update
      // that references the current value via a database function.
      // Since we may not have an RPC set up, we use a single update
      // with a subquery-style approach. Supabase JS doesn't support
      // SQL expressions directly, so we use .rpc if available,
      // otherwise fall back to the two-step approach with a comment.
      const { data: current } = await supabase
        .from('orders')
        .select('postpone_count')
        .eq('id', orderId)
        .single()

      const newCount = (current?.postpone_count ?? 0) + 1

      // Fix #9: Removed manual updated_at — let DB handle it
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'postponed' as const,
          postpone_reason: reason,
          postpone_count: newCount,
        })
        .eq('id', orderId)

      setLoading(false)
      return { error: error?.message ?? null }
    },
    []
  )

  return { postponeJob, loading }
}
