import type { Request, Response } from 'express';
import Notification from '../models/notification.model.js';
import catchAsync from '../utils/catchAsync.js';

// Helper
export const createNotification = (
	userId: string,
	message: string,
	type: 'appointment' | 'record' | 'system',
	link?: string,
): void => {
	Notification.create({ user: userId, message, type, link }).catch((err) =>
		console.error('Failed to create notification:', err),
	);
};

// @desc  Get logged-in user's notifications last 10
// @route GET /api/v1/notifications
export const getMyNotifications = catchAsync(
	async (req: Request, res: Response) => {
		const notifications = await Notification.find({ user: req.user!.id })
			.sort('-createdAt')
			.limit(10);

		res.status(200).json({
			status: 'success',
			results: notifications.length,
			data: { docs: notifications },
		});
	},
);

// @desc  Mark a single notification as read
// @route PATCH /api/v1/notifications/:id/read
export const markRead = catchAsync(async (req: Request, res: Response) => {
	await Notification.findOneAndUpdate(
		{ _id: req.params.id, user: req.user!.id },
		{ read: true },
	);
	res.status(200).json({ status: 'success' });
});

// @desc  Mark all notifications as read
// @route PATCH /api/v1/notifications/read-all
export const markAllRead = catchAsync(async (req: Request, res: Response) => {
	await Notification.updateMany(
		{ user: req.user!.id, read: false },
		{ read: true },
	);
	res.status(200).json({ status: 'success' });
});
