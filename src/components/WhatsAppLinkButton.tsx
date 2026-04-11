import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'

export interface WhatsAppLink {
  label: string
  url: string
}

export function WhatsAppLinkButton({ label, url }: WhatsAppLink) {
  return (
    <Button asChild variant="outline" className="w-full justify-start">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <MessageSquare aria-hidden="true" className="mr-2 h-4 w-4" />
        {label}
      </a>
    </Button>
  )
}
