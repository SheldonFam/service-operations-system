import { z } from 'zod'

// Request and response shapes for /api/ai-query.
//
// Note: api/ai-query.ts validates the request server-side with its own
// inline rules. Sharing the schema across the API boundary requires a
// tsconfig path tweak we haven't done — keep these in sync by hand.

export const AI_QUERY_MAX_LENGTH = 500

export const aiQueryRequestSchema = z.object({
  question: z.string().min(1).max(AI_QUERY_MAX_LENGTH),
})

export const aiQuerySuccessSchema = z.object({
  answer: z.string(),
})

export const aiQueryErrorSchema = z.object({
  error: z.string(),
})

export type AiQueryRequest = z.infer<typeof aiQueryRequestSchema>
export type AiQuerySuccess = z.infer<typeof aiQuerySuccessSchema>
export type AiQueryError = z.infer<typeof aiQueryErrorSchema>
