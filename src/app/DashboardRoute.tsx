import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function DashboardRoute() {
  const { role } = useAuth()

  if (role === 'technician') {
    return <Navigate to="/orders" replace />
  }

  return (
    <div className="py-20 text-center">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <p className="mt-1 text-sm text-muted-foreground">Coming soon</p>
    </div>
  )
}
