import Stripe from 'stripe';
import type { Request, Response, NextFunction } from 'express';
import Service from '../models/service.model.js';
import User from '../models/user.model.js';
import Appointment from '../models/appointment.model.js';
import catchAsync from '../utils/catchAsync.js';
import * as factory from './handlerFactory.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';
import Email from '../utils/email.js';
import type { AppointmentEmailData } from '../utils/email.js';
import { createNotification } from './notification.controller.js';

// Interfaces for type safety
interface PopulatedUser {
	_id: string;
	name: string;
	email: string;
}

interface PopulatedService {
	_id: string;
	name: string;
	category: string;
	price: number;
	duration: number;
}

// Email helper to send emails without blocking
const sendEmailSilently = (fn: () => Promise<void>) => {
	fn().catch((err) => console.error('Email notification failed:', err));
};

let _stripe: Stripe;
const getStripe = () => {
	if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
	return _stripe;
};

// @desc        Create Stripe checkout session for a service
// @route       GET /api/v1/appointments/checkout-session/:serviceId?doctor=xxx&date=xxx
// @access      Private
export const getCheckoutSession = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { doctor, date } = req.query;

		if (!doctor || !date) {
			return next(
				new AppError('Please provide doctor and date for the appointment', 400),
			);
		}

		const service = await Service.findById(req.params.serviceId);
		if (!service) {
			return next(new AppError('No service found with that ID', 404));
		}

		const doctorUser = await User.findById(doctor as string);
		if (!doctorUser || doctorUser.role !== 'DOCTOR') {
			return next(new AppError('Invalid doctor selected', 400));
		}

		const effectivePrice = service.priceDiscount
			? service.price - service.priceDiscount
			: service.price;

		const serviceId = req.params.serviceId as string;
		const successParams = new URLSearchParams({
			service: serviceId,
			doctor: doctor as string,
			date: date as string,
			user: req.user!.id as string,
			price: effectivePrice.toString(),
		});

		const session = await getStripe().checkout.sessions.create({
			payment_method_types: ['card'],
			mode: 'payment',
			success_url: `${process.env.FRONTEND_URL}/checkout-success?${successParams.toString()}`,
			cancel_url: `${process.env.FRONTEND_URL}/services/${service._id}?canceled=true`,
			customer_email: req.user!.email,
			client_reference_id: serviceId,
			metadata: {
				serviceId: serviceId,
				userId: req.user!.id as string,
				doctorId: doctor as string,
				date: date as string,
				price: effectivePrice.toString(),
			},
			line_items: [
				{
					price_data: {
						currency: 'eur',
						unit_amount: Math.round(effectivePrice * 100),
						product_data: {
							name: `${service.name} Service`,
							description: service.summary,
							...(service.imageCover?.startsWith('http')
								? { images: [service.imageCover] }
								: {}),
						},
					},
					quantity: 1,
				},
			],
		} as Stripe.Checkout.SessionCreateParams);

		res.status(200).json({
			status: 'success',
			session,
		});
	},
);

// @desc        Create appointment after successful Stripe checkout
// @route       POST /api/v1/appointments/create-from-checkout
// @access      Private
export const createAppointmentFromParams = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { service, doctor, date, price } = req.body;

		if (!service || !doctor || !date || !price) {
			return next(new AppError('Missing required appointment data', 400));
		}

		const existingAppointment = await Appointment.findOne({
			service: service,
			patient: req.user!.id,
			doctor: doctor,
			date: new Date(date),
		});

		if (existingAppointment) {
			return res.status(200).json({
				status: 'success',
				message: 'Appointment already exists',
				data: { appointment: existingAppointment },
			});
		}

		const appointment = await Appointment.create({
			service: service,
			patient: req.user!.id,
			doctor: doctor,
			date: new Date(date),
			price: parseFloat(price),
			paid: true,
			status: 'PENDING',
		});

		// Respond immediately — don't block on email sending
		res.status(201).json({
			status: 'success',
			data: { appointment },
		});

		// Notify patient in-app
		createNotification(
			req.user!.id,
			'Your appointment has been booked successfully.',
			'appointment',
			'/appointments',
		);

		// Send email notifications in the background (fire-and-forget)
		Appointment.findById(appointment._id)
			.then((populated) => {
				const patient = populated?.patient as unknown as
					| PopulatedUser
					| undefined;
				const doctor_ = populated?.doctor as unknown as
					| PopulatedUser
					| undefined;
				const service_ = populated?.service as unknown as
					| PopulatedService
					| undefined;

				if (patient && doctor_ && service_) {
					const emailData: AppointmentEmailData = {
						serviceName: service_.name,
						doctorName: doctor_.name,
						patientName: patient.name,
						date: populated!.date,
						price: populated!.price,
					};

					// Notify the doctor in-app
					createNotification(
						(doctor_ as unknown as { _id: { toString(): string } })._id.toString(),
						`New appointment booked by ${patient.name} for ${service_.name}.`,
						'appointment',
						'/appointments',
					);

					sendEmailSilently(() =>
						new Email(patient).sendBookingConfirmation(emailData),
					);

					sendEmailSilently(() =>
						new Email(doctor_).sendDoctorNewBooking(emailData),
					);
				}
			})
			.catch((err) => console.error('Email notification setup failed:', err));
	},
);

// @desc        Get current user's appointments (for patients)
// @route       GET /api/v1/appointments/my-appointments
// @access      Private
export const getMyAppointments = catchAsync(
	async (req: Request, res: Response) => {
		const page = Number(req.query.page) || 1;
		const limit = Math.min(Number(req.query.limit) || 10, 200);
		const skip = (page - 1) * limit;

		const baseFilter: Record<string, unknown> = { patient: req.user!.id };
		if (req.query.status) baseFilter.status = req.query.status;

		const totalCount = await Appointment.countDocuments(baseFilter);

		const appointments = await Appointment.find(baseFilter)
			.populate('service', 'name category duration imageCover')
			.populate('doctor', 'name email photo')
			.sort('-date')
			.skip(skip)
			.limit(limit);

		res.status(200).json({
			status: 'success',
			results: totalCount,
			data: { docs: appointments },
		});
	},
);

// @desc        Create new appointment (manual, without payment)
// @route       POST /api/v1/appointments
// @access      Private
export const createAppointment = factory.createOne(Appointment);

// @desc        Get appointment by ID
// @route       GET /api/v1/appointments/:id
// @access      Private
export const getAppointment = factory.getOne(Appointment);

// @desc        Get all appointments (admin sees all, doctor sees own)
// @route       GET /api/v1/appointments
// @access      Private
export const getAppointments = catchAsync(
	async (req: Request, res: Response) => {
		const baseFilter =
			req.user!.role === 'DOCTOR' ? { doctor: req.user!.id } : {};

		const countFeatures = new APIFeatures(
			Appointment.find(baseFilter),
			req.query,
		)
			.search(['status'])
			.filter();

		const totalCount = await Appointment.countDocuments(
			countFeatures.query.getFilter(),
		);

		const features = new APIFeatures(Appointment.find(baseFilter), req.query)
			.search(['status'])
			.filter()
			.sort()
			.limitFields()
			.paginate();

		const docs = await features.query;

		res.status(200).json({
			status: 'success',
			results: totalCount,
			data: { docs },
		});
	},
);

// @desc        Update appointment by ID
// @route       PATCH /api/v1/appointments/:id
// @access      Private
export const updateAppointment = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		// Capture old status before update
		const current = await Appointment.findById(req.params.id);
		if (!current) {
			return next(new AppError('No document found with that ID', 404));
		}
		const oldStatus = current.status;

		// Perform update (same as factory.updateOne)
		const doc = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});
		if (!doc) {
			return next(new AppError('No document found with that ID', 404));
		}

		// Send email if status changed
		const newStatus = doc.status;
		if (req.body.status && oldStatus !== newStatus) {
			const populated = await Appointment.findById(doc._id);
			const patient = populated?.patient as unknown as
				| PopulatedUser
				| undefined;
			const service_ = populated?.service as unknown as
				| PopulatedService
				| undefined;
			const doctor_ = populated?.doctor as unknown as PopulatedUser | undefined;

			if (patient && service_ && doctor_) {
				const emailData: AppointmentEmailData = {
					serviceName: service_.name,
					doctorName: doctor_.name,
					patientName: patient.name,
					date: populated!.date,
					price: populated!.price,
				};

				if (newStatus === 'CONFIRMED') {
					sendEmailSilently(() =>
						new Email(patient).sendAppointmentConfirmed(emailData),
					);
					createNotification(
						(patient as unknown as { _id: { toString(): string } })._id.toString(),
						'Your appointment has been confirmed.',
						'appointment',
						'/appointments',
					);
				} else if (newStatus === 'CANCELLED') {
					sendEmailSilently(() =>
						new Email(patient).sendAppointmentCancelled(emailData),
					);
					createNotification(
						(patient as unknown as { _id: { toString(): string } })._id.toString(),
						'Your appointment has been cancelled.',
						'appointment',
						'/appointments',
					);
				} else if (newStatus === 'COMPLETED') {
					sendEmailSilently(() =>
						new Email(patient).sendAppointmentCompleted(emailData),
					);
					createNotification(
						(patient as unknown as { _id: { toString(): string } })._id.toString(),
						'Your appointment has been marked as completed.',
						'appointment',
						'/appointments',
					);
				}
			}
		}

		res.status(200).json({
			status: 'success',
			data: { data: doc },
		});
	},
);

// @desc        Delete appointment by ID
// @route       DELETE /api/v1/appointments/:id
// @access      Private
export const deleteAppointment = factory.deleteOne(Appointment);
