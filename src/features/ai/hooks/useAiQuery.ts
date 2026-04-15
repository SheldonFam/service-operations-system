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

let messageIdCounter = 0
function nextId() {
  return `msg-${++messageIdCounter}`
}

export function useAiQuery() {
  const { session } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [lastFailedQuestion, setLastFailedQuestion] = useState<string | null>(null)

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
      if (!parsed.success) {
        throw new Error(GENERIC_ERROR)
      }

      return parsed.data.answer
    },
  })

  const ask = async (question: string) => {
    setLastFailedQuestion(null)

    if (!session) {
      setLastFailedQuestion(question)
      return
    }

    const userMsg: ChatMessage = { role: 'user', content: question, id: nextId() }
    setMessages((prev) => [...prev, userMsg])

    try {
      const answer = await mutation.mutateAsync(question)
      setMessages((prev) => [...prev, { role: 'assistant', content: answer, id: nextId() }])
    } catch {
      setLastFailedQuestion(question)
    }
  }

  const retry = () => {
    if (!lastFailedQuestion || mutation.isPending) return
    setMessages((prev) => {
      const lastUserIdx = [...prev].reverse().findIndex((m) => m.role === 'user')
      if (lastUserIdx === -1) return prev
      const idx = prev.length - 1 - lastUserIdx
      return prev.slice(0, idx)
    })
    void ask(lastFailedQuestion)
  }

  const clear = () => {
    setMessages([])
    setLastFailedQuestion(null)
    mutation.reset()
  }

  const error =
    mutation.error?.message ??
    (lastFailedQuestion && !session ? 'Your session has expired. Please sign in again.' : null)

  return {
    messages,
    loading: mutation.isPending,
    error,
    ask,
    retry,
    clear,
  }
}
