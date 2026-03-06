import express from 'express';
import * as reviewController from '../controllers/review.controller.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router({ mergeParams: true });

// Public: anyone can read reviews
router.route('/').get(reviewController.getAllReviews);
router.route('/:id').get(reviewController.getReview);

// Protected: must be logged in for create/update/delete
router.use(authController.jwtProtect);

router
	.route('/')
	.post(
		authController.restrictTo('USER'),
		reviewController.setServiceUserIds,
		reviewController.createReview,
	);

router
	.route('/:id')
	.patch(
		authController.restrictTo('ADMIN', 'USER'),
		reviewController.checkReviewOwnership,
		reviewController.updateReview,
	)
	.delete(
		authController.restrictTo('ADMIN', 'USER'),
		reviewController.checkReviewOwnership,
		reviewController.deleteReview,
	);

export default router;
