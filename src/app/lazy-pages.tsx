import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })))
export const OrdersDispatcher = lazy(() => import('@/features/orders/pages/OrdersDispatcher').then(m => ({ default: m.OrdersDispatcher })))
export const OrderCreatePage = lazy(() => import('@/features/orders/pages/OrderCreatePage').then(m => ({ default: m.OrderCreatePage })))
export const OrderDetailPage = lazy(() => import('@/features/orders/pages/OrderDetailPage').then(m => ({ default: m.OrderDetailPage })))
export const OrderSummaryPage = lazy(() => import('@/features/orders/pages/OrderSummaryPage').then(m => ({ default: m.OrderSummaryPage })))
export const ServiceCompletePage = lazy(() => import('@/features/jobs/pages/ServiceCompletePage').then(m => ({ default: m.ServiceCompletePage })))
export const DashboardRoute = lazy(() => import('./DashboardRoute').then(m => ({ default: m.DashboardRoute })))

export function PageLoader() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

export function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </ErrorBoundary>
  )
}
