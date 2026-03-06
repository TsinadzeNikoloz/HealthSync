import express from 'express';
import * as appointmentController from '../controllers/appointment.controller.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.use(authController.jwtProtect);

// Patient-only routes
router.get(
	'/checkout-session/:serviceId',
	authController.restrictTo('USER'),
	appointmentController.getCheckoutSession,
);

router.post(
	'/create-from-checkout',
	authController.restrictTo('USER'),
	appointmentController.createAppointmentFromParams,
);

router.get(
	'/my-appointments',
	authController.restrictTo('USER'),
	appointmentController.getMyAppointments,
);

router.use(authController.restrictTo('ADMIN', 'DOCTOR'));

router
	.route('/')
	.get(appointmentController.getAppointments)
	.post(appointmentController.createAppointment);

router
	.route('/:id')
	.get(appointmentController.getAppointment)
	.patch(appointmentController.updateAppointment)
	.delete(appointmentController.deleteAppointment);

export default router;
