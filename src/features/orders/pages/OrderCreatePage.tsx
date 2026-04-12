import { OrderForm } from '../components/OrderForm'

export function OrderCreatePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 sm:py-4">
      <div>
        <h1 className="text-2xl font-semibold">Create New Order</h1>
        <p className="text-sm text-muted-foreground">Fill in the details below to create a new service order.</p>
      </div>
      <OrderForm />
    </div>
  )
}
