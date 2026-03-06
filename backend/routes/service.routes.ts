import express from 'express';
import * as serviceController from '../controllers/service.controller.js';
import * as authController from '../controllers/auth.controller.js';
import reviewRouter from './review.routes.js';

const router = express.Router();

// Rerouting service reviews to review router
router.use('/:serviceId/reviews', reviewRouter);

router
	.route('/top-5-cheap')
	.get(serviceController.aliasTopServices, serviceController.getAllServices);

router.route('/service-stats').get(serviceController.getServiceStats);

router
	.route('/')
	.get(serviceController.getAllServices)
	.post(
		authController.jwtProtect,
		authController.restrictTo('ADMIN'),
		serviceController.createService,
	);

router
	.route('/:id')
	.get(serviceController.getService)
	.patch(
		authController.jwtProtect,
		authController.restrictTo('ADMIN'),
		serviceController.updateService,
	)
	.delete(
		authController.jwtProtect,
		authController.restrictTo('ADMIN'),
		serviceController.deleteService,
	);

export default router;
