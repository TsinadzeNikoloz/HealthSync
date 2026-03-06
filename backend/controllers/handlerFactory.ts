import type { Model } from 'mongoose';
import type { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';

export const createOne = <T>(ModelRef: Model<T>) =>
	catchAsync(async (req: Request, res: Response) => {
		const doc = await ModelRef.create(req.body);

		res.status(201).json({
			status: 'success',
			data: { data: doc },
		});
	});

export const getAll = <T>(ModelRef: Model<T>) =>
	catchAsync(async (req: Request, res: Response) => {
		// Allowing nested GET reviews on service
		let filter: Record<string, unknown> = {};
		if (req.params.serviceId) filter = { service: req.params.serviceId };

		// Count total documents matching the filter (before pagination)
		const countFeatures = new APIFeatures(ModelRef.find(filter), req.query)
			.search()
			.filter();
		const totalCount = await ModelRef.countDocuments(
			countFeatures.query.getFilter(),
		);

		// EXECUTE QUERY
		const features = new APIFeatures(ModelRef.find(filter), req.query)
			.search()
			.filter()
			.sort()
			.limitFields()
			.paginate();
		const docs = await features.query;

		// Send Response
		res.status(200).json({
			status: 'success',
			requestedAt: req.requestTime,
			results: totalCount,
			data: {
				docs,
			},
		});
	});

export const getOne = <T>(ModelRef: Model<T>, populateOptions?: any) =>
	catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		let query = ModelRef.findById(req.params.id);
		if (populateOptions) query = query.populate(populateOptions);
		const doc = await query;

		if (!doc) {
			return next(new AppError('No document found with that ID', 404));
		}

		res.status(200).json({
			status: 'success',
			data: {
				doc,
			},
		});
	});

export const updateOne = <T>(ModelRef: Model<T>) =>
	catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const doc = await ModelRef.findById(req.params.id);

		if (!doc) {
			return next(new AppError('No document found with that ID', 404));
		}

		// Now TS knows 'doc' has Mongoose methods and properties from T
		Object.assign(doc, req.body);
		await doc.save();

		res.status(200).json({
			status: 'success',
			data: { data: doc },
		});
	});

export const deleteOne = <T>(ModelRef: Model<T>) =>
	catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const doc = await ModelRef.findByIdAndDelete(req.params.id);

		if (!doc) {
			return next(new AppError('No document found with that ID', 404));
		}

		res.status(204).json({
			status: 'success',
			data: null,
		});
	});
