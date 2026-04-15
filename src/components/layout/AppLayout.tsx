import { lazy, Suspense } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AdminSidebar } from './AdminSidebar'
import { Header } from './Header'
import { cn } from '@/lib/utils'

const AiChatWindow = lazy(() =>
  import('@/features/ai/components/AiChatWindow').then((m) => ({ default: m.AiChatWindow })),
)

function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
    >
      Skip to main content
    </a>
  )
}

export function AppLayout() {
  const { role } = useAuth()
  const isTechnician = role === 'technician'
  const isManager = role === 'manager'
  const hasSidebar = !isTechnician

  const content = (
    <>
      <SkipLink />
      {hasSidebar && <AdminSidebar />}
      <div className={cn('flex flex-1 flex-col', !hasSidebar && 'min-h-screen')}>
        <Header />
        <main
          id="main-content"
          tabIndex={-1}
          className={cn(
            'flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            hasSidebar ? 'p-4 sm:p-6' : 'px-4 py-4',
          )}
        >
          <Outlet />
        </main>
      </div>
      {isManager && (
        <Suspense fallback={null}>
          <AiChatWindow />
        </Suspense>
      )}
      <ScrollRestoration />
    </>
  )

  // SidebarProvider is only needed for admin/manager layouts.
  return hasSidebar ? <SidebarProvider>{content}</SidebarProvider> : content
}
