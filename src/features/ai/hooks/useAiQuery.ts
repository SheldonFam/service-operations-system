import { useMemo, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useAuth } from '@/features/auth/hooks/useAuth'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  id: string
}

function toDisplayContent(m: UIMessage): string {
  return m.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

export function useAiQuery() {
  const { session } = useAuth()
  const [lastQuestion, setLastQuestion] = useState<string | null>(null)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/ai-query',
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      }),
    [session],
  )

  const { messages, sendMessage, status, error, setMessages, regenerate } = useChat({ transport })

  const loading = status === 'submitted' || status === 'streaming'

  const displayMessages: ChatMessage[] = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ id: m.id, role: m.role as 'user' | 'assistant', content: toDisplayContent(m) }))
    // Hide empty assistant placeholders while the first token is still in flight.
    .filter((m) => m.role === 'user' || m.content.length > 0)

  const ask = (question: string) => {
    if (!session) return
    setLastQuestion(question)
    void sendMessage({ text: question })
  }

  const retry = () => {
    if (loading) return
    if (messages.length > 0) {
      void regenerate()
      return
    }
    if (lastQuestion) void sendMessage({ text: lastQuestion })
  }

  const clear = () => {
    setMessages([])
    setLastQuestion(null)
  }

  return {
    messages: displayMessages,
    loading,
    error: error?.message ?? null,
    ask,
    retry,
    clear,
  }
}
