import type { ReactNode } from 'react'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { TooltipProvider } from '@/components/ui/tooltip'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </AuthProvider>
  )
}
