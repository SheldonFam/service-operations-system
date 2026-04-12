import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

export function DashboardRoute() {
  const { role } = useAuth()

  if (role !== 'manager') {
    return <Navigate to="/orders" replace />
  }

  return <DashboardPage />
}
