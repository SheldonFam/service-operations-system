import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { aiQueryErrorSchema, aiQuerySuccessSchema } from '../schemas/ai-query.schema'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  id: string
}

const GENERIC_ERROR = "Couldn't read the AI response. Please try again."

export function useAiQuery() {
  const { session } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const mutation = useMutation({
    mutationFn: async (question: string): Promise<string> => {
      if (!session) {
        throw new Error('Your session has expired. Please sign in again.')
      }

      const res = await fetch('/api/ai-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ question }),
      })

      const raw: unknown = await res.json().catch(() => null)

      if (!res.ok) {
        const parsed = aiQueryErrorSchema.safeParse(raw)
        throw new Error(parsed.success ? parsed.data.error : 'Something went wrong.')
      }

      const parsed = aiQuerySuccessSchema.safeParse(raw)
      if (!parsed.success) throw new Error(GENERIC_ERROR)

      return parsed.data.answer
    },
    onSuccess: (answer) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: answer, id: crypto.randomUUID() }])
    },
  })

  const ask = (question: string) => {
    setMessages((prev) => [...prev, { role: 'user', content: question, id: crypto.randomUUID() }])
    mutation.mutate(question)
  }

  // The user message is already in `messages` from the failed ask() —
  // re-run the mutation with the same question that React Query remembered.
  const retry = () => {
    if (mutation.variables && !mutation.isPending) {
      mutation.mutate(mutation.variables)
    }
  }

  const clear = () => {
    setMessages([])
    mutation.reset()
  }

  return {
    messages,
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
    ask,
    retry,
    clear,
  }
}
