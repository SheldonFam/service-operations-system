import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { NotFoundPage } from './NotFoundPage'
import { DashboardRoute } from './DashboardRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { OrdersDispatcher } from '@/features/orders/pages/OrdersDispatcher'
import { OrderCreatePage } from '@/features/orders/pages/OrderCreatePage'
import { OrderDetailPage } from '@/features/orders/pages/OrderDetailPage'
import { OrderSummaryPage } from '@/features/orders/pages/OrderSummaryPage'
import { ServiceCompletePage } from '@/features/jobs/pages/ServiceCompletePage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardRoute />,
      },
      {
        path: 'orders',
        element: <OrdersDispatcher />,
      },
      {
        path: 'orders/new',
        element: (
          <ProtectedRoute roles={['admin']}>
            <OrderCreatePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:id',
        element: <OrderDetailPage />,
      },
      {
        path: 'orders/:id/summary',
        element: (
          <ProtectedRoute roles={['admin']}>
            <OrderSummaryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:id/complete',
        element: (
          <ProtectedRoute roles={['technician']}>
            <ServiceCompletePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
