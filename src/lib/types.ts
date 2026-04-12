export type UserRole = 'admin' | 'technician' | 'manager'

export type OrderStatus = 'new' | 'assigned' | 'in_progress' | 'postponed' | 'job_done' | 'reviewed' | 'closed'

export type ServiceType = 'Cleaning' | 'Repair' | 'Installation' | 'Gas Refill' | 'Inspection'

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Card' | 'E-Wallet'

export interface User {
  id: string
  name: string
  role: UserRole
  email: string | null
  phone: string | null
  branch: string | null
  created_at: string
}

export interface Order {
  id: string
  order_no: string
  customer_name: string
  phone: string
  address: string
  problem_description: string
  service_type: ServiceType
  quoted_price: number
  assigned_technician: string | null
  admin_notes: string | null
  status: OrderStatus
  postpone_reason: string | null
  postpone_count: number
  created_at: string
  updated_at: string
  created_by: string
  technician?: User | null
  service_record?: ServiceRecord | null
}

export interface ServiceRecord {
  id: string
  order_id: string
  technician_id: string
  work_done: string
  extra_charges: number
  final_amount: number
  remarks: string | null
  payment_amount: number | null
  payment_method: PaymentMethod | null
  receipt_photo: string | null
  completed_at: string
  created_at: string
  photos?: ServicePhoto[]
}

export interface ServicePhoto {
  id: string
  service_record_id: string
  file_url: string
  file_type: 'image' | 'video' | 'pdf'
  uploaded_at: string
}
