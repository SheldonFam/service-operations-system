import { supabase } from './supabase'
import { PHOTO_SIGN_TTL_SECONDS, getFileType, safeExtension, validateUploadFiles } from './files'
import type { Order, OrderStatus, PaymentMethod, ServiceType, User } from './types'
import type { OrderFormValues } from '@/features/orders/schemas/order.schema'

// ---------------------------------------------------------------------------
// Sejuk Sejuk Service — Supabase data access layer
// ---------------------------------------------------------------------------
//
// Every supabase.from / supabase.rpc / supabase.storage call lives here so
// that hooks and components have one place to read from. This makes it easy
// to add caching, request logging, telemetry, or swap the backing store
// later. Hooks keep their own loading/error/state — this module just returns
// `{ data, error }` shapes that mirror the Supabase client.

// Re-export the auth client so AuthContext can keep its own session lifecycle
// without importing supabase directly. The session listener wiring is too
// stateful to live in this module.
export { supabase as authClient } from './supabase'

type Result<T> = { data: T | null; error: string | null }
type VoidResult = { error: string | null }

function err(message: string | undefined): string | null {
  return message ?? null
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export interface ListOrdersOptions {
  status?: OrderStatus
  search?: string
}

const ORDERS_QUERY_LIMIT = 100
const JOBS_QUERY_LIMIT = 200
const DASHBOARD_QUERY_LIMIT = 500

// Matches the exact columns SELECTed in listOrders — avoids lying by casting
// to the full Order type (which includes fields not in this query).
export interface OrderListRow {
  id: string
  order_no: string
  customer_name: string
  phone: string
  address: string
  service_type: ServiceType
  status: OrderStatus
  quoted_price: number
  assigned_technician: string | null
  postpone_count: number
  created_at: string
  updated_at: string
  technician: { id: string; name: string } | null
}

export async function listOrders(
  opts: ListOrdersOptions | undefined,
  signal: AbortSignal,
): Promise<Result<OrderListRow[]>> {
  let query = supabase
    .from('orders')
    .select(
      'id, order_no, customer_name, phone, address, service_type, status, quoted_price, assigned_technician, postpone_count, created_at, updated_at, technician:users!assigned_technician(id, name)',
    )
    .order('created_at', { ascending: false })
    // Server-side cap so an unexpectedly large dataset can't blow up the UI.
    // OrderListPage filters/searches on this slice; bump if real usage demands.
    .limit(ORDERS_QUERY_LIMIT)

  if (opts?.status) {
    query = query.eq('status', opts.status)
  }
  if (opts?.search) {
    // Escape special PostgREST filter characters (commas, parens, backslashes)
    // before interpolating into the `.or()` string so user input can't break
    // the filter syntax or inject extra predicates.
    const escaped = opts.search.replace(/[\\(),]/g, (ch) => `\\${ch}`)
    const term = `%${escaped}%`
    query = query.or(`customer_name.ilike.${term},order_no.ilike.${term}`)
  }

  const { data, error } = await query.abortSignal(signal)
  return { data: (data as OrderListRow[] | null) ?? [], error: err(error?.message) }
}

export async function getOrderById(id: string, signal: AbortSignal): Promise<Result<Order>> {
  const { data, error } = await supabase
    .from('orders')
    .select(
      '*, technician:users!assigned_technician(id, name, phone), service_record:service_records(*, photos:service_photos(*))',
    )
    .eq('id', id)
    .abortSignal(signal)
    .single()

  return { data: normalizeOrder(data), error: err(error?.message) }
}

// Supabase returns a one-to-many join (`service_record`) as an array even
// when the relationship is one-to-one. Collapse it to a scalar without
// mutating the original row.

/** The raw shape Supabase returns before we normalize the joined fields. */
interface RawOrderRow extends Omit<Order, 'service_record'> {
  service_record: Order['service_record'][] | Order['service_record'] | null
}

function normalizeOrder(raw: unknown): Order | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as RawOrderRow
  const { service_record, ...rest } = row
  const collapsed: Order['service_record'] = Array.isArray(service_record)
    ? (service_record[0] ?? null)
    : (service_record ?? null)
  return { ...rest, service_record: collapsed }
}

export type OrderUpdatable = Partial<
  Pick<Order, 'status' | 'assigned_technician' | 'postpone_reason' | 'postpone_count' | 'admin_notes'>
>

export async function updateOrder(id: string, updates: OrderUpdatable): Promise<VoidResult> {
  const { error } = await supabase.from('orders').update(updates).eq('id', id)
  return { error: err(error?.message) }
}

export async function createOrder(values: OrderFormValues, createdBy: string): Promise<Result<Order>> {
  const orderNo = await generateOrderNo()
  const status: OrderStatus = values.assigned_technician ? 'assigned' : 'new'

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

  return { data: (data as Order | null) ?? null, error: err(error?.message) }
}

export async function generateOrderNo(): Promise<string> {
  const { data, error } = await supabase.rpc('generate_order_no')
  if (error) throw new Error(`Failed to generate order number: ${error.message}`)
  if (typeof data !== 'string') throw new Error('generate_order_no returned unexpected type')
  return data
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function getUserProfile(userId: string): Promise<Result<User>> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, role, email, phone, branch, created_at')
    .eq('id', userId)
    .single()
  return { data: (data as User | null) ?? null, error: err(error?.message) }
}

export async function listUsersByRole(role: 'technician' | 'manager'): Promise<Result<User[]>> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, phone, branch, role')
    .eq('role', role)
    .order('name')
  return { data: (data as User[] | null) ?? [], error: err(error?.message) }
}

// ---------------------------------------------------------------------------
// Jobs (technician views)
// ---------------------------------------------------------------------------

// Only the columns actually SELECTed — avoids a lying cast to the full Order
// type whose extra fields (admin_notes, created_by, technician, service_record)
// would be `undefined` at runtime.
export interface JobListRow {
  id: string
  order_no: string
  customer_name: string
  phone: string
  address: string
  problem_description: string
  service_type: Order['service_type']
  status: OrderStatus
  quoted_price: number
  assigned_technician: string | null
  postpone_count: number
  postpone_reason: string | null
  created_at: string
  updated_at: string
}

export async function listJobsForTechnician(
  technicianId: string,
  statuses: OrderStatus[] | undefined,
  signal: AbortSignal,
): Promise<Result<JobListRow[]>> {
  let query = supabase
    .from('orders')
    .select(
      'id, order_no, customer_name, phone, address, problem_description, service_type, status, quoted_price, assigned_technician, postpone_count, postpone_reason, created_at, updated_at',
    )
    .eq('assigned_technician', technicianId)
    .order('updated_at', { ascending: false })
    .limit(JOBS_QUERY_LIMIT)

  if (statuses && statuses.length > 0) {
    query = query.in('status', statuses)
  }

  const { data, error } = await query.abortSignal(signal)
  return { data: (data as JobListRow[] | null) ?? [], error: err(error?.message) }
}

export interface CompleteServiceInput {
  work_done: string
  extra_charges: number
  final_amount: number
  completed_at: string
  remarks?: string
  payment_amount?: number
  payment_method?: PaymentMethod
  receipt_photo?: string
}

export interface CompleteServiceResult {
  serviceRecordId: string | null
  error: string | null
}

export async function completeService(
  orderId: string,
  technicianId: string,
  data: CompleteServiceInput,
): Promise<CompleteServiceResult> {
  // Uses the `complete_service` RPC which inserts the service record AND
  // updates the order status atomically in a single transaction. This
  // prevents orphaned records when the status update would have failed.
  const { data: recordId, error } = await supabase.rpc('complete_service', {
    p_order_id: orderId,
    p_technician_id: technicianId,
    p_work_done: data.work_done,
    p_extra_charges: data.extra_charges,
    p_final_amount: data.final_amount,
    p_remarks: data.remarks || null,
    p_payment_amount: data.payment_amount || null,
    p_payment_method: data.payment_method || null,
    p_receipt_photo: data.receipt_photo || null,
    p_completed_at: data.completed_at,
  })

  if (error) {
    return { serviceRecordId: null, error: error.message }
  }

  return { serviceRecordId: typeof recordId === 'string' ? recordId : null, error: null }
}

export async function postponeOrder(orderId: string, reason: string): Promise<VoidResult> {
  const { error } = await supabase.rpc('postpone_order', {
    p_order_id: orderId,
    p_reason: reason,
  })
  return { error: err(error?.message) }
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface DashboardOrderRow {
  id: string
  status: OrderStatus
  quoted_price: number
  assigned_technician: string | null
  postpone_count: number
  created_at: string
  technician: { id: string; name: string } | null
  service_record: { final_amount: number }[] | null
}

export async function listOrdersForDashboard(
  dateFilter: string | null,
  signal: AbortSignal,
): Promise<Result<DashboardOrderRow[]>> {
  let query = supabase
    .from('orders')
    .select(
      'id, status, quoted_price, assigned_technician, postpone_count, created_at, technician:users!assigned_technician(id, name), service_record:service_records(final_amount)',
    )
    .order('created_at', { ascending: false })
    .limit(DASHBOARD_QUERY_LIMIT)

  if (dateFilter) {
    query = query.gte('created_at', dateFilter)
  }

  const { data, error } = await query.abortSignal(signal)
  return {
    data: (data as DashboardOrderRow[] | null) ?? [],
    error: err(error?.message),
  }
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

export interface UploadPhotoResult {
  urls: string[]
  error: string | null
}

export interface UploadPhotoOptions {
  signal?: AbortSignal
  onProgress?: (percent: number) => void
}

export async function uploadServicePhotos(
  serviceRecordId: string,
  files: File[],
  options: UploadPhotoOptions = {},
): Promise<UploadPhotoResult> {
  if (files.length === 0) return { urls: [], error: null }

  const { signal, onProgress } = options

  // Pre-validate all files up front so we don't upload some then bail.
  const invalid = validateUploadFiles(files)
  if (invalid) return { urls: [], error: invalid.reason }

  const total = files.length

  // Stage 1: Upload all files to storage in parallel.
  // Each file gets its own path; we collect metadata for the bulk DB insert.
  interface UploadResult {
    path: string
    file: File
    error: string | null
  }

  // Use Promise.allSettled-style approach: every upload runs to completion
  // and we report progress monotonically (processed / total).
  let processed = 0
  const results = await Promise.all(
    files.map(async (file): Promise<UploadResult> => {
      if (signal?.aborted) return { path: '', file, error: 'Upload cancelled' }

      const ext = safeExtension(file.name)!
      const path = `${serviceRecordId}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('service-photos')
        .upload(path, file, { contentType: file.type || undefined })

      processed += 1
      onProgress?.(Math.round((processed / total) * 100))

      if (uploadError) return { path, file, error: `Failed to upload ${file.name}: ${uploadError.message}` }
      return { path, file, error: null }
    }),
  )

  const uploaded = results.filter((r) => !r.error)
  const firstError = results.find((r) => r.error)
  if (firstError?.error) {
    // Clean up successfully uploaded files so they don't become orphaned
    // storage objects with no corresponding service_photos DB row.
    if (uploaded.length > 0) {
      await supabase.storage
        .from('service-photos')
        .remove(uploaded.map((u) => u.path))
        .catch(() => {
          /* best-effort cleanup */
        })
    }
    return { urls: [], error: firstError.error }
  }

  if (signal?.aborted) return { urls: [], error: 'Upload cancelled' }

  // Stage 2: One batched insert for all photo metadata rows instead of N
  // individual round-trips.
  const rows = uploaded.map((u) => ({
    service_record_id: serviceRecordId,
    file_url: u.path,
    file_type: getFileType(u.file),
  }))

  const { error: insertError } = await supabase.from('service_photos').insert(rows)

  if (insertError) {
    return { urls: uploaded.map((u) => u.path), error: `Failed to record photos: ${insertError.message}` }
  }

  return { urls: uploaded.map((u) => u.path), error: null }
}

export type SignedUrlsResult = { ok: true; urls: Record<string, string> } | { ok: false; error: string }

export async function signServicePhotoUrls(paths: string[]): Promise<SignedUrlsResult> {
  if (paths.length === 0) return { ok: true, urls: {} }

  const { data, error } = await supabase.storage.from('service-photos').createSignedUrls(paths, PHOTO_SIGN_TTL_SECONDS)

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Failed to load photo URLs' }
  }

  const urls: Record<string, string> = {}
  for (const item of data) {
    if (item.path && item.signedUrl) {
      urls[item.path] = item.signedUrl
    }
  }
  return { ok: true, urls }
}
