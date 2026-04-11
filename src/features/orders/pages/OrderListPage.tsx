import { useState } from 'react'
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
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { ORDER_STATUSES, STATUS_CONFIG } from '@/lib/constants'
import type { OrderStatus } from '@/lib/types'
import { PlusCircle, Search } from 'lucide-react'

export function OrderListPage() {
  const navigate = useNavigate()
  const { role } = useAuth()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>()

  // Wait 300 ms after the user stops typing before hitting the API.
  // Note: useDeferredValue would show stale results instantly (no delay),
  // but debouncing avoids unnecessary Supabase calls on every keystroke.
  const debouncedSearch = useDebouncedValue(search, 300)
  const { data: orders, isPending, error } = useOrders({ status: statusFilter, search: debouncedSearch || undefined })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        {role === 'admin' && (
          <Button onClick={() => navigate('/orders/new')}>
            <PlusCircle aria-hidden="true" className="mr-2 h-4 w-4" />
            New Order
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="order-search" className="sr-only">Search orders</label>
          <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="order-search"
            type="search"
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
          <SelectTrigger aria-label="Filter by status" className="w-full sm:w-[180px]">
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

      {error && (
        <p role="alert" className="text-sm text-destructive">
          Failed to load orders. Please try again.
        </p>
      )}
      <OrderTable orders={orders ?? []} loading={isPending} />
    </div>
  )
}
