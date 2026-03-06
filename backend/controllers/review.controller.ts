import type { Request, Response, NextFunction } from 'express';
import Review from '../models/review.model.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import * as factory from './handlerFactory.js';

export const setServiceUserIds = (
	req: Request,
	_res: Response,
	next: NextFunction,
) => {
	if (!req.body.service) req.body.service = req.params.serviceId;
	if (!req.body.user) req.body.user = req.user!.id;
	next();
};

// @desc        Get all reviews (supports nested service reviews)
// @route       GET /api/v1/reviews
// @route       GET /api/v1/services/:serviceId/reviews
// @access      Public
export const getAllReviews = factory.getAll(Review);

// @desc        Get single review by id
// @route       GET /api/v1/reviews/:id
// @access      Public
export const getReview = factory.getOne(Review);

// @desc        Create new review for a service
// @route       POST /api/v1/reviews
// @route       POST /api/v1/services/:serviceId/reviews
// @access      Private
export const createReview = factory.createOne(Review);

// @desc        Middleware — ensures only the review author (or admin) can modify/delete
export const checkReviewOwnership = catchAsync(
	async (req: Request, _res: Response, next: NextFunction) => {
		if (req.user!.role === 'ADMIN') return next();

		const review = await Review.findById(req.params.id);
		if (!review) {
			return next(new AppError('No review found with that ID', 404));
		}

		if (review.user.toString() !== req.user!.id) {
			return next(
				new AppError('You do not have permission to modify this review', 403),
			);
		}

		next();
	},
);

// @desc        Update review by id
// @route       PATCH /api/v1/reviews/:id
// @access      Private
export const updateReview = factory.updateOne(Review);

// @desc        Delete review by id
// @route       DELETE /api/v1/reviews/:id
// @access      Private
export const deleteReview = factory.deleteOne(Review);
