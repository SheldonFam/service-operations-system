import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface NotFoundFallbackProps {
  message?: string
  backLabel?: string
  backTo?: string
}

export function NotFoundFallback({
  message = 'Order not found',
  backLabel = 'Back to orders',
  backTo = '/orders',
}: NotFoundFallbackProps) {
  return (
    <div className="py-12 text-center">
      <p className="text-muted-foreground">{message}</p>
      <Button variant="link" asChild>
        <Link to={backTo}>{backLabel}</Link>
      </Button>
    </div>
  )
}
