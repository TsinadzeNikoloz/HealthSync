import { formatDistance, parseISO, format } from "date-fns";

export function getUserPhotoUrl(photo?: string | null, name = 'U'): string {
  if (!photo) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff`;
  if (photo.startsWith('http') || photo.startsWith('/img')) return photo;
  return `/img/users/${photo}`;
}

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("jwt");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function formatDistanceFromNow(dateStr: string): string {
  return formatDistance(parseISO(dateStr), new Date(), {
    addSuffix: true,
  })
    .replace("about ", "")
    .replace("in", "In");
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "EEE, MMM dd yyyy");
}

export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), "EEE, MMM dd yyyy, HH:mm");
}

export function getToday(options?: { end?: boolean }): string {
  const today = new Date();
  if (options?.end) {
    today.setUTCHours(23, 59, 59, 999);
  } else {
    today.setUTCHours(0, 0, 0, 0);
  }
  return today.toISOString();
}
