import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WhatsAppLinkButton, type WhatsAppLink } from '@/components/WhatsAppLinkButton'
import { CheckCircle2 } from 'lucide-react'

interface CompletionNotificationsProps {
  notifications: WhatsAppLink[]
}

export function CompletionNotifications({ notifications }: CompletionNotificationsProps) {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-emerald-600" />
          Job Completed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Send the WhatsApp notifications below. Each link opens in a new tab.
        </p>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recipients to notify.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li key={n.url}>
                <WhatsAppLinkButton label={`Send to ${n.label}`} url={n.url} />
              </li>
            ))}
          </ul>
        )}
        <Button type="button" className="w-full" onClick={() => navigate('/orders')}>
          Done
        </Button>
      </CardContent>
    </Card>
  )
}
