import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'

export interface WhatsAppLink {
  label: string
  url: string
}

interface WhatsAppLinkButtonProps extends WhatsAppLink {
  className?: string
  size?: ComponentProps<typeof Button>['size']
}

export function WhatsAppLinkButton({ label, url, className, size }: WhatsAppLinkButtonProps) {
  return (
    <Button asChild variant="outline" size={size} className={className}>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <MessageSquare aria-hidden="true" className="mr-2 h-4 w-4" />
        {label}
      </a>
    </Button>
  )
}
