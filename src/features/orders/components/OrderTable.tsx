import { Link } from 'react-router-dom'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from './StatusBadge'
import type { OrderListRow } from '@/lib/supabase-queries'
import { formatDate, formatCurrency } from '@/lib/utils'

interface OrderTableProps {
  orders: OrderListRow[]
  loading: boolean
}

export function OrderTable({ orders, loading }: OrderTableProps) {
  if (loading) {
    return (
      <div className="space-y-3" role="status" aria-busy="true" aria-label="Loading orders">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return <div className="py-12 text-center text-muted-foreground">No orders found</div>
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableCaption className="sr-only">List of orders. Open an order by activating its order number.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="whitespace-nowrap">
                Order No
              </TableHead>
              <TableHead scope="col">Customer</TableHead>
              <TableHead scope="col" className="hidden sm:table-cell">
                Service
              </TableHead>
              <TableHead scope="col" className="hidden md:table-cell">
                Technician
              </TableHead>
              <TableHead scope="col" className="hidden sm:table-cell">
                Price
              </TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col" className="hidden md:table-cell">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="group relative cursor-pointer transition-colors hover:bg-muted/50">
                <TableCell className="whitespace-nowrap font-medium">
                  <Link
                    to={`/orders/${order.id}`}
                    aria-label={`Order ${order.order_no} — ${order.customer_name}`}
                    className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm after:absolute after:inset-0 after:content-['']"
                  >
                    {order.order_no}
                  </Link>
                </TableCell>
                <TableCell>{order.customer_name}</TableCell>
                <TableCell className="hidden sm:table-cell">{order.service_type}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {order.technician?.name ?? <span className="text-muted-foreground">Unassigned</span>}
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
      {orders.length >= 100 && (
        <p className="text-center text-xs text-muted-foreground">
          Showing up to 100 orders. Use search or filters to find specific orders.
        </p>
      )}
    </div>
  )
}
