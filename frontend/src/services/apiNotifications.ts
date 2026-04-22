import apiClient from './apiClient';
import type { Notification } from '../types';

export async function getNotifications(): Promise<Notification[]> {
	const { data } = await apiClient.get('/notifications');
	return data.data.docs as Notification[];
}

export async function markNotificationRead(id: string): Promise<void> {
	await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
	await apiClient.patch('/notifications/read-all');
}
