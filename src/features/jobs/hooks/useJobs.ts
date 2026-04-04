import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus } from '@/lib/types'

// Fix #4: Accept a serializable key instead of an array reference,
// so the dependency doesn't change on every render.
export function useJobs(technicianId: string, statuses?: OrderStatus[]) {
  const [jobs, setJobs] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)
  const fetchIdRef = useRef(0)
  // Serialize statuses so the dependency is a stable string, not a new array ref
  const statusKey = statuses?.join(',') ?? ''

  useEffect(() => {
    if (!technicianId) return

    const id = ++fetchIdRef.current

    let query = supabase
      .from('orders')
      .select('*')
      .eq('assigned_technician', technicianId)
      .order('updated_at', { ascending: false })

    if (statusKey) {
      query = query.in('status', statusKey.split(','))
    }

    query.then(({ data, error: fetchError }) => {
      if (fetchIdRef.current !== id) return
      if (fetchError) {
        setError(fetchError.message)
        setJobs([])
      } else {
        setError(null)
        setJobs((data as Order[]) ?? [])
      }
      setLoading(false)
    })
  }, [technicianId, statusKey, fetchKey])

  const refetch = useCallback(() => {
    setLoading(true)
    setFetchKey((k) => k + 1)
  }, [])

  return { jobs, loading, error, refetch }
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
        payment_amount?: number
        payment_method?: string
        receipt_photo?: string
      },
    ) => {
      setLoading(true)

      try {
        const { data: record, error: recordError } = await supabase
          .from('service_records')
          .insert({
            order_id: orderId,
            technician_id: technicianId,
            work_done: data.work_done,
            extra_charges: data.extra_charges,
            final_amount: data.final_amount,
            remarks: data.remarks || null,
            payment_amount: data.payment_amount || null,
            payment_method: data.payment_method || null,
            receipt_photo: data.receipt_photo || null,
            completed_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (recordError) {
          return { serviceRecordId: null, error: recordError.message }
        }

        // Fix #9: Removed manual updated_at — let DB handle it
        const { error: orderError } = await supabase
          .from('orders')
          .update({ status: 'job_done' as const })
          .eq('id', orderId)

        if (orderError) {
          return { serviceRecordId: record.id as string, error: orderError.message }
        }

        return { serviceRecordId: record.id as string, error: null }
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return { completeJob, loading }
}

export function usePostponeJob() {
  const [loading, setLoading] = useState(false)

  const postponeJob = useCallback(async (orderId: string, reason: string) => {
    setLoading(true)

    try {
      const { error } = await supabase.rpc('postpone_order', {
        p_order_id: orderId,
        p_reason: reason,
      })

      return { error: error?.message ?? null }
    } finally {
      setLoading(false)
    }
  }, [])

  return { postponeJob, loading }
}
