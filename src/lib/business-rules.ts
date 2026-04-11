import type { OrderStatus } from './types'

// ---------------------------------------------------------------------------
// Status transition predicates
// ---------------------------------------------------------------------------
//
// Centralizes the "what can happen to an order in this status" logic that
// used to live inline across OrderActions, ServiceCompletePage, and the
// dashboard hooks. Keep all stringly-typed status checks here so a future
// status addition (or rename) is a single-file change.

export function canAssign(status: OrderStatus): boolean {
  return status === 'new' || status === 'postponed'
}

export function canStart(status: OrderStatus): boolean {
  return status === 'assigned'
}

export function canComplete(status: OrderStatus): boolean {
  return status === 'in_progress'
}

export function canReview(status: OrderStatus): boolean {
  return status === 'job_done'
}

export function canClose(status: OrderStatus): boolean {
  return status === 'reviewed'
}

export function isCompleted(status: OrderStatus): boolean {
  return status === 'job_done' || status === 'reviewed' || status === 'closed'
}

export function isPendingReview(status: OrderStatus): boolean {
  return status === 'job_done'
}

export function isReassignment(status: OrderStatus): boolean {
  return status === 'postponed'
}

// Target status for each transition. Centralized so a status rename is a
// single-file change rather than a hunt through component callsites.
export const STATUS_AFTER_ASSIGN: OrderStatus = 'assigned'
export const STATUS_AFTER_START: OrderStatus = 'in_progress'
export const STATUS_AFTER_COMPLETE: OrderStatus = 'job_done'
export const STATUS_AFTER_REVIEW: OrderStatus = 'reviewed'
export const STATUS_AFTER_CLOSE: OrderStatus = 'closed'

// ---------------------------------------------------------------------------
// Job tabs (technician view)
// ---------------------------------------------------------------------------

export type JobTab = 'pending' | 'in_progress' | 'completed'

export const TAB_STATUSES: Record<JobTab, OrderStatus[]> = {
  pending: ['assigned'],
  in_progress: ['in_progress', 'postponed'],
  completed: ['job_done', 'reviewed', 'closed'],
}
