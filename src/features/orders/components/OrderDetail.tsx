import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StatusTimeline } from './StatusTimeline'
import { SERVICE_TYPE_COLORS } from '@/lib/constants'
import type { Order } from '@/lib/types'
import { formatCurrency, formatDateTime, cn, getPhotoUrl } from '@/lib/utils'
import {
  User,
  Phone,
  MapPin,
  FileText,
  Wrench,
  DollarSign,
  Clock,
  MessageSquare,
} from 'lucide-react'

interface OrderDetailProps {
  order: Order
}

export function OrderDetail({ order }: OrderDetailProps) {
  return (
    <div className="space-y-6">
      {/* Status Timeline */}
      <Card className="p-3 sm:p-4">
        <StatusTimeline
          currentStatus={order.status}
          postponeCount={order.postpone_count}
        />
      </Card>

      {/* Order Info */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{order.customer_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${order.phone}`} className="text-primary underline">
                {order.phone}
              </a>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>{order.address}</span>
            </div>
          </CardContent>
        </Card>

        {/* Service Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>{order.problem_description}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <Badge
                variant="secondary"
                className={cn(SERVICE_TYPE_COLORS[order.service_type])}
              >
                {order.service_type}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {formatCurrency(order.quoted_price)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>
                {order.technician?.name ?? (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {formatDateTime(order.created_at)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Notes */}
      {order.admin_notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2">
              <MessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>{order.admin_notes}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Postpone Reason */}
      {order.postpone_reason && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-base text-orange-700">
              Postpone Reason
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{order.postpone_reason}</p>
          </CardContent>
        </Card>
      )}

      {/* Service Record */}
      {order.service_record && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Service Record</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Work Done</p>
              <p>{order.service_record.work_done}</p>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Quoted Price</p>
                <p className="font-medium">
                  {formatCurrency(order.quoted_price)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Extra Charges</p>
                <p className="font-medium">
                  {formatCurrency(order.service_record.extra_charges)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Final Amount</p>
                <p className="text-lg font-semibold text-primary">
                  {formatCurrency(order.service_record.final_amount)}
                </p>
              </div>
            </div>
            {order.service_record.remarks && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Remarks</p>
                  <p>{order.service_record.remarks}</p>
                </div>
              </>
            )}
            {order.service_record.photos &&
              order.service_record.photos.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      Service Photos
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {order.service_record.photos.map((photo) => (
                        <a
                          key={photo.id}
                          href={getPhotoUrl(photo.file_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="overflow-hidden rounded-md border"
                        >
                          {photo.file_type === 'image' ? (
                            <img
                              src={getPhotoUrl(photo.file_url)}
                              alt="Service photo"
                              className="aspect-square object-cover"
                            />
                          ) : (
                            <div className="flex aspect-square items-center justify-center bg-muted text-xs text-muted-foreground">
                              {photo.file_type.toUpperCase()}
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
