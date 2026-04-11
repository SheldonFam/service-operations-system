import {
  Sparkles,
  UserCheck,
  Wrench,
  PauseCircle,
  CircleCheck,
  ShieldCheck,
  Lock,
  type LucideIcon,
} from "lucide-react";
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

// Each status pairs an icon with the label so the badge does not rely on
// colour alone (WCAG 1.4.1). Background/foreground pairings target a contrast
// ratio of at least 7:1 against the default light background.
export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string; icon: LucideIcon }
> = {
  new: {
    label: "New",
    className: "bg-slate-100 text-slate-800",
    icon: Sparkles,
  },
  assigned: {
    label: "Assigned",
    className: "bg-blue-100 text-blue-800",
    icon: UserCheck,
  },
  in_progress: {
    label: "In Progress",
    className: "bg-amber-100 text-amber-900",
    icon: Wrench,
  },
  postponed: {
    label: "Postponed",
    className: "bg-orange-100 text-orange-900",
    icon: PauseCircle,
  },
  job_done: {
    label: "Job Done",
    className: "bg-emerald-100 text-emerald-800",
    icon: CircleCheck,
  },
  reviewed: {
    label: "Reviewed",
    className: "bg-violet-100 text-violet-800",
    icon: ShieldCheck,
  },
  closed: {
    label: "Closed",
    className: "bg-slate-200 text-slate-700",
    icon: Lock,
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

// File upload limits — also enforced server-side in supabase-queries.ts
// (uploadServicePhotos) and intended to match supabase storage policies.
export const MAX_FILES = 6;
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
export const ACCEPTED_UPLOAD_MIME = "image/*,video/*,application/pdf";
