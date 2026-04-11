import { Badge } from '@/components/ui/badge'
import { STATUS_CONFIG } from '@/lib/constants'
import type { OrderStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { CircleDot } from 'lucide-react'

const FALLBACK_CONFIG = { label: 'Unknown', className: '', icon: CircleDot }

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? FALLBACK_CONFIG
  const Icon = config.icon

  return (
    <Badge
      variant="secondary"
      className={cn(config.className, 'font-medium', className)}
    >
      <Icon aria-hidden="true" data-icon="inline-start" />
      {config.label}
    </Badge>
  )
}
