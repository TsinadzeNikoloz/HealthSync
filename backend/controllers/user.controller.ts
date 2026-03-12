import sharp from 'sharp';
import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError.js';
import User from '../models/user.model.js';
import Appointment from '../models/appointment.model.js';
import APIFeatures from '../utils/apiFeatures.js';
import catchAsync from '../utils/catchAsync.js';
import * as factory from './handlerFactory.js';

const multerStorage = multer.memoryStorage();

const multerFilter = (
	_req: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback,
) => {
	if (file.mimetype.startsWith('image')) {
		cb(null, true);
	} else {
		cb(
			new AppError(
				'Not an image! Please upload only images',
				400,
			) as unknown as Error,
		);
	}
};

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
});

export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = catchAsync(
	async (req: Request, _res: Response, next: NextFunction) => {
		if (!req.file) return next();

		req.file.filename = `user-${req.user!.id}-${Date.now()}.jpeg`;

		await sharp(req.file.buffer)
			.resize(500, 500)
			.toFormat('jpeg')
			.jpeg({ quality: 90 })
			.toFile(`public/img/users/${req.file.filename}`);

		next();
	},
);

const filterObj = (
	obj: Record<string, unknown>,
	...allowedFields: string[]
): Record<string, unknown> => {
	const newObj: Record<string, unknown> = {};
	Object.keys(obj).forEach((el) => {
		if (allowedFields.includes(el)) newObj[el] = obj[el];
	});
	return newObj;
};

// @desc        Get all doctors (public)
// @route       GET /api/v1/users/doctors
// @access      Public
export const getAllDoctors = catchAsync(async (req: Request, res: Response) => {
	const features = new APIFeatures(
		User.find({ role: 'DOCTOR' }),
		req.query,
	)
		.search(['name', 'specialty'])
		.filter()
		.sort()
		.paginate();

	const docs = await features.query.select('name email photo specialty availability');
	const total = await User.countDocuments({ role: 'DOCTOR' });

	res.status(200).json({
		status: 'success',
		results: total,
		data: { docs },
	});
});

// @desc        Get all users
// @route       GET /api/v1/users
// @access      Private (admin)
export const getAllUsers = factory.getAll(User);

// @desc        Get user by id
// @route       GET /api/v1/users/:id
// @access      Private (admin)

export const getUser = factory.getOne(User);
// @desc        Create new user
// @route       POST /api/v1/users
// @access      Private (admin)

export const createUser = factory.createOne(User);
// @desc        Update user by id
// @route       PATCH /api/v1/users/:id
// @access      Private (admin)
export const updateUser = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const doc = await User.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!doc) {
			return next(new AppError('No document found with that ID', 404));
		}

		res.status(200).json({
			status: 'success',
			data: { data: doc },
		});
	},
);
// @desc        Delete user by id
// @route       DELETE /api/v1/users/:id
// @access      Private (admin)
export const deleteUser = factory.deleteOne(User);

// @desc        Get currently logged-in user data
// @route       GET /api/v1/users/me
// @access      Private
export const getMe = (req: Request, _res: Response, next: NextFunction) => {
	req.params.id = req.user!.id;
	next();
};

// @desc        Update currently logged-in user data (name, email, photo)
// @route       PATCH /api/v1/users/updateMe
// @access      Private
export const updateMe = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		if (req.body.password || req.body.passwordConfirm) {
			return next(
				new AppError(
					'This route is not for password updates, Please use /updateMyPassword',
					400,
				),
			);
		}

		const filteredBody = filterObj(
			req.body,
			'name',
			'email',
			'twoFactorEnabled',
			'phone',
			'gender',
			'dateOfBirth',
			'address',
			'availability',
		) as Record<string, unknown>;
		if (req.file) filteredBody.photo = req.file.filename;
		const updatedUser = await User.findByIdAndUpdate(
			req.user!.id,
			filteredBody,
			{
				new: true,
				runValidators: true,
			},
		);

		res.status(200).json({
			status: 'success',
			data: { user: updatedUser },
		});
	},
);

// @desc        Deactivate currently logged-in user account
// @route       DELETE /api/v1/users/deleteMe
// @access      Private
export const deleteMe = catchAsync(async (req: Request, res: Response) => {
	await User.findByIdAndDelete(req.user!.id);

	res.status(204).json({
		status: 'success',
		data: null,
	});
});

// @desc        Get available time slots for a doctor on a given date
// @route       GET /api/v1/users/availability/:doctorId
// @access      Public
export const getAvailableSlots = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { doctorId } = req.params;
		const { date, duration } = req.query as { date?: string; duration?: string };

		if (!date) {
			return next(new AppError('Please provide a date query parameter', 400));
		}

		const requestedDate = new Date(date);
		if (isNaN(requestedDate.getTime())) {
			return next(new AppError('Invalid date format', 400));
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);
		if (requestedDate < today) {
			return next(new AppError('Cannot fetch slots for past dates', 400));
		}

		const doctor = await User.findById(doctorId).select('availability role');
		if (!doctor || doctor.role !== 'DOCTOR') {
			return next(new AppError('No doctor found with that ID', 404));
		}

		const dayOfWeek = requestedDate.getDay();
		const window = doctor.availability?.find((a) => a.dayOfWeek === dayOfWeek);

		if (!window) {
			return res.status(200).json({ status: 'success', data: { slots: [] } });
		}

		const slotMinutes = duration ? parseInt(duration, 10) : 30;
		const allSlots = generateSlots(window.startTime, window.endTime, slotMinutes);

		// Get booked start times for this doctor on this date
		const dayStart = new Date(date);
		dayStart.setHours(0, 0, 0, 0);
		const dayEnd = new Date(date);
		dayEnd.setHours(23, 59, 59, 999);

		const booked = await Appointment.find({
			doctor: doctorId,
			status: { $in: ['PENDING', 'CONFIRMED'] },
			date: { $gte: dayStart, $lte: dayEnd },
		}).select('date');

		const bookedTimes = new Set(
			booked.map((appt) => {
				const d = new Date(appt.date);
				return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
			}),
		);

		const availableSlots = allSlots.filter((slot) => !bookedTimes.has(slot));

		res.status(200).json({ status: 'success', data: { slots: availableSlots } });
	},
);

function generateSlots(
	startTime: string,
	endTime: string,
	stepMinutes: number,
): string[] {
	const slots: string[] = [];
	const [startH, startM] = startTime.split(':').map(Number);
	const [endH, endM] = endTime.split(':').map(Number);
	let current = startH * 60 + startM;
	const end = endH * 60 + endM;
	while (current + stepMinutes <= end) {
		const h = String(Math.floor(current / 60)).padStart(2, '0');
		const m = String(current % 60).padStart(2, '0');
		slots.push(`${h}:${m}`);
		current += stepMinutes;
	}
	return slots;
}
