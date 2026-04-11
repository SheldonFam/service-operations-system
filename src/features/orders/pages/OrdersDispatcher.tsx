// Routes /orders to JobListPage for technicians and OrderListPage for
// admin/manager. Kept as a single component (rather than two routes) so the
// URL stays the same regardless of role.
import { useAuth } from '@/features/auth/hooks/useAuth'
import { OrderListPage } from './OrderListPage'
import { JobListPage } from '@/features/jobs/pages/JobListPage'

export function OrdersDispatcher() {
  const { role } = useAuth()

  if (role === 'technician') {
    return <JobListPage />
  }

  return <OrderListPage />
}
