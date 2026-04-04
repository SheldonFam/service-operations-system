import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import {
  LoginPage,
  OrdersPage,
  OrderCreatePage,
  OrderDetailPage,
  OrderSummaryPage,
  ServiceCompletePage,
  DashboardRoute,
  SuspenseWrapper,
} from './lazy-pages'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
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
        element: (
          <SuspenseWrapper>
            <DashboardRoute />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'orders',
        element: (
          <SuspenseWrapper>
            <OrdersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'orders/new',
        element: (
          <ProtectedRoute roles={['admin']}>
            <SuspenseWrapper>
              <OrderCreatePage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <SuspenseWrapper>
            <OrderDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'orders/:id/summary',
        element: (
          <ProtectedRoute roles={['admin']}>
            <SuspenseWrapper>
              <OrderSummaryPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:id/complete',
        element: (
          <ProtectedRoute roles={['technician']}>
            <SuspenseWrapper>
              <ServiceCompletePage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
    ],
  },
])
