import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus, User } from '@/lib/types'
import { generateOrderNo } from '@/lib/utils'
import type { OrderFormValues } from '../schemas/order.schema'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UseOrdersOptions {
  status?: OrderStatus
  search?: string
}

/** Only the columns that exist on the `orders` table — prevents accidentally
 *  sending joined/virtual fields (technician, service_record) to Supabase. */
type OrderUpdatable = Partial<
  Pick<Order, 'status' | 'assigned_technician' | 'postpone_reason' | 'postpone_count' | 'admin_notes'>
>

// ---------------------------------------------------------------------------
// useOrders — list with search + status filter
// ---------------------------------------------------------------------------

function buildOrdersQuery(opts?: UseOrdersOptions) {
  let query = supabase
    .from('orders')
    .select('*, technician:users!assigned_technician(*)')
    .order('created_at', { ascending: false })

  if (opts?.status) {
    query = query.eq('status', opts.status)
  }
  if (opts?.search) {
    const term = `%${opts.search}%`
    query = query.or(`customer_name.ilike.${term},order_no.ilike.${term}`)
  }
  return query
}

export function useOrders(options?: UseOrdersOptions) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)
  const fetchIdRef = useRef(0)
  // Serialize options to a stable string so inline objects don't cause re-fetches
  const optionsKey = `${options?.status ?? ''}|${options?.search ?? ''}`

  useEffect(() => {
    const id = ++fetchIdRef.current

    buildOrdersQuery(options).then(({ data, error: queryError }) => {
      if (fetchIdRef.current !== id) return
      setOrders((data as Order[]) ?? [])
      setError(queryError?.message ?? null)
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsKey, fetchKey])

  const refetch = useCallback(() => {
    setLoading(true)
    setFetchKey((k) => k + 1)
  }, [])

  return { orders, loading, error, refetch }
}

// ---------------------------------------------------------------------------
// useOrder — single order with joins
// ---------------------------------------------------------------------------

export function useOrder(id: string) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    supabase
      .from('orders')
      .select('*, technician:users!assigned_technician(*), service_record:service_records(*, photos:service_photos(*))')
      .eq('id', id)
      .single()
      .then(({ data, error: queryError }) => {
        if (cancelled) return

        if (data) {
          // Supabase returns one-to-many joins as arrays even for logically
          // 1:1 relations (one order → one service_record). Unwrap it.
          const record = data as Record<string, unknown>
          if (Array.isArray(record.service_record)) {
            record.service_record = record.service_record.length > 0 ? record.service_record[0] : null
          }
        }

        setOrder((data as Order) ?? null)
        setError(queryError?.message ?? null)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, fetchKey])

  const refetch = useCallback(() => {
    setLoading(true)
    setFetchKey((k) => k + 1)
  }, [])

  return { order, loading, error, refetch }
}

// ---------------------------------------------------------------------------
// useCreateOrder
// ---------------------------------------------------------------------------

export function useCreateOrder() {
  const [loading, setLoading] = useState(false)

  const createOrder = useCallback(async (values: OrderFormValues, createdBy: string) => {
    setLoading(true)
    try {
      const orderNo = await generateOrderNo()
      const status = values.assigned_technician ? 'assigned' : 'new'

      const { data, error } = await supabase
        .from('orders')
        .insert({
          order_no: orderNo,
          customer_name: values.customer_name,
          phone: values.phone,
          address: values.address,
          problem_description: values.problem_description,
          service_type: values.service_type,
          quoted_price: values.quoted_price,
          assigned_technician: values.assigned_technician || null,
          admin_notes: values.admin_notes || null,
          status,
          created_by: createdBy,
        })
        .select()
        .single()

      return { data: data as Order | null, error: error?.message ?? null }
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e.message : 'Unknown error',
      }
    } finally {
      setLoading(false)
    }
  }, [])

  return { createOrder, loading }
}

// ---------------------------------------------------------------------------
// useUpdateOrder
// ---------------------------------------------------------------------------

export function useUpdateOrder() {
  const [loading, setLoading] = useState(false)

  const updateOrder = useCallback(async (id: string, updates: OrderUpdatable) => {
    setLoading(true)
    try {
      const { error } = await supabase.from('orders').update(updates).eq('id', id)
      return { error: error?.message ?? null }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Unknown error' }
    } finally {
      setLoading(false)
    }
  }, [])

  return { updateOrder, loading }
}

// ---------------------------------------------------------------------------
// useTechnicians — cached, with retry on failure
// ---------------------------------------------------------------------------

let techCache: User[] | undefined
let techInflight: Promise<User[]> | undefined

function loadTechnicians(): Promise<User[]> {
  if (techCache) return Promise.resolve(techCache)
  if (techInflight) return techInflight

  techInflight = Promise.resolve(supabase.from('users').select('*').eq('role', 'technician').order('name')).then(
    ({ data }) => {
      const result = (data as User[]) ?? []
      if (result.length > 0) techCache = result // only cache success
      techInflight = undefined
      return result
    },
  )

  return techInflight
}

export function useTechnicians() {
  const [technicians, setTechnicians] = useState<User[]>(() => techCache ?? [])
  const [loading, setLoading] = useState(() => !techCache)

  useEffect(() => {
    if (techCache) return

    let cancelled = false
    loadTechnicians().then((data) => {
      if (!cancelled) {
        setTechnicians(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { technicians, loading }
}
