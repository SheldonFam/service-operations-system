import { STATUS_FLOW, STATUS_CONFIG } from '@/lib/constants'
import type { OrderStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface StatusTimelineProps {
  currentStatus: OrderStatus
  postponeCount?: number
}

export function StatusTimeline({
  currentStatus,
  postponeCount,
}: StatusTimelineProps) {
  const currentIndex = STATUS_FLOW.indexOf(currentStatus)
  const isPostponed = currentStatus === 'postponed'
  const effectiveIndex = isPostponed
    ? STATUS_FLOW.indexOf('in_progress')
    : currentIndex

  return (
    <div className="w-full">
      <div className="flex items-start justify-between">
        {STATUS_FLOW.map((status, index) => {
          const isCompleted = index < effectiveIndex
          const isCurrent =
            index === effectiveIndex ||
            (isPostponed && status === 'in_progress')
          const config = STATUS_CONFIG[status]
          const isLast = index === STATUS_FLOW.length - 1
          // The connector between this step and the next is "filled"
          // if the next step is completed or current
          const connectorFilled = index < effectiveIndex

          return (
            <div key={status} className="flex flex-1 items-start last:flex-initial">
              {/* Step: circle + label stacked */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-medium sm:h-8 sm:w-8 sm:text-xs',
                    isCompleted &&
                      'border-primary bg-primary text-primary-foreground',
                    isCurrent &&
                      !isCompleted &&
                      'border-primary bg-primary/10',
                    !isCompleted &&
                      !isCurrent &&
                      'border-muted-foreground/30 text-muted-foreground',
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'mt-1 max-w-14 text-center text-[9px] leading-tight sm:mt-1.5 sm:max-w-16 sm:text-[10px]',
                    isCurrent || isCompleted
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {config.label}
                </span>
              </div>

              {/* Connector line between steps */}
              {!isLast && (
                <div
                  className={cn(
                    'mt-[11px] mx-0.5 h-0.5 flex-1 rounded-full sm:mt-[15px] sm:mx-1.5',
                    connectorFilled ? 'bg-primary' : 'bg-muted',
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {isPostponed && postponeCount !== undefined && postponeCount > 0 && (
        <p className="mt-3 text-center text-xs text-orange-600">
          Postponed {postponeCount} time{postponeCount > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
