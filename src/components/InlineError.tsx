import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCcw } from 'lucide-react'

interface InlineErrorProps {
  message: string
  onRetry?: () => void
  className?: string
}

export function InlineError({ message, onRetry, className }: InlineErrorProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive ${className ?? ''}`}
    >
      <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">
        <p>{message}</p>
        {onRetry && (
          <Button type="button" variant="outline" size="sm" onClick={onRetry} className="mt-2 h-7 gap-1.5 text-xs">
            <RotateCcw aria-hidden="true" className="h-3 w-3" />
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}
