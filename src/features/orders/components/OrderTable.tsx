import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from './StatusBadge'
import type { Order } from '@/lib/types'
import { formatDate, formatCurrency } from '@/lib/utils'

interface OrderTableProps {
  orders: Order[]
  loading: boolean
}

export function OrderTable({ orders, loading }: OrderTableProps) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No orders found
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Order No</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="hidden sm:table-cell">Service</TableHead>
            <TableHead className="hidden md:table-cell">Technician</TableHead>
            <TableHead className="hidden sm:table-cell">Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              role="link"
              tabIndex={0}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => navigate(`/orders/${order.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate(`/orders/${order.id}`)
                }
              }}
            >
              <TableCell className="whitespace-nowrap font-medium">{order.order_no}</TableCell>
              <TableCell>{order.customer_name}</TableCell>
              <TableCell className="hidden sm:table-cell">{order.service_type}</TableCell>
              <TableCell className="hidden md:table-cell">
                {order.technician?.name ?? (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell">{formatCurrency(order.quoted_price)}</TableCell>
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {formatDate(order.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
