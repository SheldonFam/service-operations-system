import { Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AdminSidebar } from './AdminSidebar'
import { BottomNav } from './BottomNav'
import { Header } from './Header'
import { AiChatWindow } from '@/features/ai/components/AiChatWindow'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const { role } = useAuth()
  const isTechnician = role === 'technician'

  if (isTechnician) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 px-4 py-4 pb-20">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    )
  }

  const isManager = role === 'manager'

  return (
    <SidebarProvider>
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className={cn('flex-1 p-4 sm:p-6')}>
          <Outlet />
        </main>
      </div>
      {isManager && <AiChatWindow />}
    </SidebarProvider>
  )
}
