import { API_URL } from "../utils/constants";
import { getAuthHeaders } from "../utils/helpers";
import type { Notification } from "../types";

export async function getNotifications(): Promise<Notification[]> {
  const res = await fetch(`${API_URL}/notifications`, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message);
  }

  return data.data.notifications as Notification[];
}

export async function markNotificationRead(id: string): Promise<void> {
  await fetch(`${API_URL}/notifications/${id}/read`, {
    method: "PATCH",
    credentials: "include",
    headers: getAuthHeaders(),
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  await fetch(`${API_URL}/notifications/read-all`, {
    method: "PATCH",
    credentials: "include",
    headers: getAuthHeaders(),
  });
}
