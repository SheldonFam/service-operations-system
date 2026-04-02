import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

export function DashboardRoute() {
  const { role, loading } = useAuth()

  if (loading) return null

  if (role !== 'manager') {
    return <Navigate to="/orders" replace />
  }

  return <DashboardPage />
}
