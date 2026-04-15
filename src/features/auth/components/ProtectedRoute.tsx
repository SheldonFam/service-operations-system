import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Spinner } from '@/components/Spinner'
import type { UserRole } from '@/lib/types'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  roles?: UserRole[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return <Spinner fullScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && (!role || !roles.includes(role))) {
    return <Navigate to="/orders" replace />
  }

  return <>{children}</>
}
