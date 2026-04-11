import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Extract up to 2 initials from a display name. */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Map a raw Supabase auth error to a user-friendly message.
 * Generic enough to avoid leaking whether an email exists.
 */
export function mapSignInError(error: string): string {
  if (/invalid|credential|email|password/i.test(error)) {
    return 'Invalid email or password.'
  }
  return 'Sign-in failed. Please try again.'
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return 'RM 0.00'
  return `RM ${amount.toFixed(2)}`;
}

export function buildTelHref(phone: string): string {
  const normalized = phone.replace(/\s/g, '')
  return normalized ? `tel:${normalized}` : ''
}

export function generateWhatsAppUrl(
  phone: string,
  message: string
): string {
  // Normalize Malaysian phone: 0123456789 → 60123456789
  let normalized = phone.replace(/[^0-9+]/g, "");
  if (normalized.startsWith("0")) {
    normalized = "60" + normalized.slice(1);
  } else if (normalized.startsWith("+")) {
    normalized = normalized.slice(1);
  }
  if (!normalized) return ''
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encoded}`;
}

export function buildJobDoneMessage(params: {
  customerName: string;
  orderId: string;
  technicianName: string;
  completedAt: string;
}): string {
  return `Hi ${params.customerName},\nJob ${params.orderId} has been completed by Technician ${params.technicianName} at ${formatDateTime(params.completedAt)}.\nPlease check and leave feedback.\nThank you!`;
}

export function buildManagerNotifyMessage(params: {
  orderId: string;
  customerName: string;
  technicianName: string;
  completedAt: string;
}): string {
  return `Job Completed Notification:\nOrder ${params.orderId} for customer ${params.customerName} has been completed by Technician ${params.technicianName} at ${formatDateTime(params.completedAt)}.\nPlease review the service record.`;
}

export function buildAssignmentMessage(params: {
  technicianName: string;
  orderId: string;
  customerName: string;
  address: string;
  serviceType: string;
}): string {
  return `Hi ${params.technicianName},\nYou have been assigned a new job:\nOrder: ${params.orderId}\nCustomer: ${params.customerName}\nAddress: ${params.address}\nService: ${params.serviceType}\nPlease check the portal for details.`;
}
