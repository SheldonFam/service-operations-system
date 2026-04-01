import { useAuth } from '@/features/auth/hooks/useAuth'
import { OrderListPage } from './OrderListPage'
import { JobListPage } from '@/features/jobs/pages/JobListPage'

export function OrdersPage() {
  const { role } = useAuth()

  if (role === 'technician') {
    return <JobListPage />
  }

  return <OrderListPage />
}
