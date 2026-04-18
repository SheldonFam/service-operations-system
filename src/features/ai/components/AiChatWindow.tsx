import { useState, useRef, useEffect, type SyntheticEvent } from 'react'
import Markdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAiQuery } from '../hooks/useAiQuery'
import { cn } from '@/lib/utils'
import { InlineError } from '@/components/InlineError'
import { Bot, Send, Trash2 } from 'lucide-react'

const SUGGESTIONS = [
  'How many jobs were completed today?',
  'Which technician completed the most jobs this week?',
  'What jobs did technician Ali complete last week?',
]

export function AiChatWindow() {
  const { messages, loading, error, ask, retry, clear } = useAiQuery()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
  }, [messages, error, loading])

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    await ask(q)
  }

  const handleSuggestion = async (q: string) => {
    if (loading) return
    await ask(q)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          aria-label="Open AI assistant"
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
        >
          <Bot aria-hidden="true" className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between pr-8">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Bot aria-hidden="true" className="h-4 w-4" />
              AI Assistant
            </SheetTitle>
            {messages.length > 0 && (
              <Button variant="ghost" size="icon-sm" onClick={clear} aria-label="Clear chat">
                <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Messages */}
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-busy={loading}
          aria-label="AI assistant conversation"
          className="flex-1 overflow-y-auto p-4"
        >
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Bot aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Ask about your operations</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  I can answer questions about orders, technicians, and job performance.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Try asking:</p>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    disabled={loading}
                    className="block w-full cursor-pointer rounded-lg border p-2.5 text-left text-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                      msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted',
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">Thinking…</div>
                </div>
              )}
              {error && !loading && <InlineError message={error} onRetry={retry} />}
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" size="icon" aria-label="Send question" disabled={loading || !input.trim()}>
            <Send aria-hidden="true" className="h-4 w-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
