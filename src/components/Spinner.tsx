import { cn } from '@/lib/utils'

interface SpinnerProps {
  /** When true, fills the viewport (use for full-page loading states). */
  fullScreen?: boolean
  className?: string
}

export function Spinner({ fullScreen = false, className }: SpinnerProps) {
  const wrapperClass = fullScreen
    ? 'flex h-screen items-center justify-center'
    : 'flex items-center justify-center py-8'

  return (
    <div className={cn(wrapperClass, className)} role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
