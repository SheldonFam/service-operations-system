import type { OrderStatus, PaymentMethod, ServiceType } from "./types";

export const SERVICE_TYPES: ServiceType[] = [
  "Cleaning",
  "Repair",
  "Installation",
  "Gas Refill",
  "Inspection",
];

export const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "assigned",
  "in_progress",
  "postponed",
  "job_done",
  "reviewed",
  "closed",
];

export const STATUS_FLOW: OrderStatus[] = [
  "new",
  "assigned",
  "in_progress",
  "job_done",
  "reviewed",
  "closed",
];

export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  new: {
    label: "New",
    className: "bg-gray-100 text-gray-700",
  },
  assigned: {
    label: "Assigned",
    className: "bg-blue-100 text-blue-700",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-yellow-100 text-yellow-700",
  },
  postponed: {
    label: "Postponed",
    className: "bg-orange-100 text-orange-700",
  },
  job_done: {
    label: "Job Done",
    className: "bg-green-100 text-green-700",
  },
  reviewed: {
    label: "Reviewed",
    className: "bg-purple-100 text-purple-700",
  },
  closed: {
    label: "Closed",
    className: "bg-gray-200 text-gray-500",
  },
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Bank Transfer',
  'Card',
  'E-Wallet',
];

export const SERVICE_TYPE_COLORS: Record<ServiceType, string> = {
  Cleaning: "bg-blue-100 text-blue-700",
  Repair: "bg-red-100 text-red-700",
  Installation: "bg-green-100 text-green-700",
  "Gas Refill": "bg-orange-100 text-orange-700",
  Inspection: "bg-purple-100 text-purple-700",
};
