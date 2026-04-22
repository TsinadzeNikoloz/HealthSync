import sharp from 'sharp';
import multer from 'multer';
import mongoose from 'mongoose';
import type { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError.js';
import Service from '../models/service.model.js';
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
		cb(new AppError('Not an image! Please upload only images', 400) as unknown as Error);
	}
};

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
});

export const uploadServiceImage = upload.single('imageCover');

export const resizeServiceImage = catchAsync(
	async (req: Request, _res: Response, next: NextFunction) => {
		if (!req.file) return next();

		const id = req.params.id ?? new mongoose.Types.ObjectId().toString();
		req.body.imageCover = `service-${id}-${Date.now()}-cover.jpeg`;

		await sharp(req.file.buffer)
			.resize(2000, 1333)
			.toFormat('jpeg')
			.jpeg({ quality: 90 })
			.toFile(`public/img/services/${req.body.imageCover}`);

		next();
	},
);

export const aliasTopServices = (
	req: Request,
	_res: Response,
	next: NextFunction,
) => {
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,category';
	next();
};

// @desc        Get all services
// @route       GET /api/v1/services
// @access      Public
export const getAllServices = factory.getAll(Service);

// @desc        Get single service by slug or id (with reviews)
// @route       GET /api/v1/services/:id
// @access      Public
export const getService = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const id = req.params.id as string;
		const query = mongoose.Types.ObjectId.isValid(id)
			? Service.findById(id)
			: Service.findOne({ slug: id });

		const service = await query.populate('reviews');

		if (!service) return next(new AppError('No service found', 404));

		res.status(200).json({ status: 'success', data: { doc: service } });
	},
);

// @desc        Create new service
// @route       POST /api/v1/services
// @access      Private
export const createService = factory.createOne(Service);

// @desc        Update service by id
// @route       PATCH /api/v1/services/:id
// @access      Private
export const updateService = factory.updateOne(Service);

// @desc        Delete service by id
// @route       DELETE /api/v1/services/:id
// @access      Private
export const deleteService = factory.deleteOne(Service);

// @desc        Get service statistics using aggregation
// @route       GET /api/v1/services/service-stats
// @access      Public
export const getServiceStats = catchAsync(
	async (_req: Request, res: Response) => {
		const stats = await Service.aggregate([
			{
				$match: { ratingsAverage: { $gte: 4.5 } },
			},
			{
				$group: {
					_id: { $toUpper: '$category' },
					numServices: { $sum: 1 },
					numRatings: { $sum: '$ratingsQuantity' },
					avgRating: { $avg: '$ratingsAverage' },
					avgPrice: { $avg: '$price' },
					minPrice: { $min: '$price' },
					maxPrice: { $max: '$price' },
				},
			},
			{
				$sort: { avgPrice: 1 },
			},
		]);

		res.status(200).json({
			status: 'success',
			data: {
				stats,
			},
		});
	},
);
