// Shared date-window helpers for dashboards and reports.
// The duplicate logic in api/ai-query.ts (system prompt) is intentional —
// it lives in a string for the LLM and can't import this module.

export type DateRange = 'week' | 'month' | 'all'

/** MYT is UTC+8 with no DST. */
const MYT_OFFSET_MS = 8 * 60 * 60 * 1000

/**
 * Return an ISO-8601 timestamp representing midnight in MYT, `days` days
 * before today. Using a fixed timezone avoids the boundary sliding across
 * the day when the server-generated ISO string differs from the user's wall
 * clock (which is always MYT for Sejuk Sejuk).
 */
function midnightMYT(daysAgo: number): string {
  // Compute the current date in MYT by shifting UTC time forward by +8h,
  // then zero out the time and subtract `daysAgo` days. This avoids
  // `toLocaleString` parsing which is not guaranteed by the spec.
  const nowUtc = Date.now()
  const mytNow = new Date(nowUtc + MYT_OFFSET_MS)
  // mytNow's UTC fields now correspond to MYT wall-clock values.
  mytNow.setUTCHours(0, 0, 0, 0)
  mytNow.setUTCDate(mytNow.getUTCDate() - daysAgo)

  // Convert back to real UTC by subtracting the offset.
  const utc = new Date(mytNow.getTime() - MYT_OFFSET_MS)
  return utc.toISOString()
}

export function getDateFilter(range: DateRange): string | null {
  if (range === 'all') return null
  if (range === 'week') return midnightMYT(7)
  return midnightMYT(30)
}
