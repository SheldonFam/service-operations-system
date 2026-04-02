import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(amount: number): string {
  return `RM ${amount.toFixed(2)}`;
}

export async function generateOrderNo(): Promise<string> {
  const today = new Date();
  const dateStr =
    today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");
  const prefix = `ORD-${dateStr}-`;

  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .like("order_no", `${prefix}%`);

  const seq = String((count ?? 0) + 1).padStart(3, "0");
  return `${prefix}${seq}`;
}

export function getPhotoUrl(fileUrl: string): string {
  // If already a full URL, return as-is
  if (fileUrl.startsWith('http')) return fileUrl;
  // Otherwise it's a storage path — resolve via Supabase public URL
  const { data } = supabase.storage.from('service-photos').getPublicUrl(fileUrl);
  return data.publicUrl;
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
