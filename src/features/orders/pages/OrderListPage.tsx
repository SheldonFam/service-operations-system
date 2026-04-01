import { useDeferredValue, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OrderTable } from '../components/OrderTable'
import { useOrders } from '../hooks/useOrders'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ORDER_STATUSES, STATUS_CONFIG } from '@/lib/constants'
import type { OrderStatus } from '@/lib/types'
import { PlusCircle, Search } from 'lucide-react'

export function OrderListPage() {
  const navigate = useNavigate()
  const { role } = useAuth()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>()

  // Debounce search via useDeferredValue — low-priority update, no extra state
  const deferredSearch = useDeferredValue(search)
  const options = useMemo(
    () => ({ status: statusFilter, search: deferredSearch || undefined }),
    [statusFilter, deferredSearch],
  )
  const { orders, loading } = useOrders(options)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        {role === 'admin' && (
          <Button onClick={() => navigate('/orders/new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Order
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by customer or order no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter ?? 'all'}
          onValueChange={(v) =>
            setStatusFilter(v === 'all' ? undefined : (v as OrderStatus))
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_CONFIG[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <OrderTable orders={orders} loading={loading} />
    </div>
  )
}
