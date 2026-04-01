import { Snowflake } from 'lucide-react'
import { UserMenu } from './UserMenu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function Header() {
  const { role } = useAuth()
  const showSidebarTrigger = role !== 'technician'

  return (
    <header className="flex h-14 items-center gap-3 border-b px-4">
      {showSidebarTrigger && <SidebarTrigger />}
      <div className="flex items-center gap-2">
        <Snowflake className="h-5 w-5 text-primary" />
        <span className="font-semibold">Sejuk Sejuk</span>
      </div>
      <div className="ml-auto">
        <UserMenu />
      </div>
    </header>
  )
}
