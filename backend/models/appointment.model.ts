import mongoose, { Document, Schema } from 'mongoose';
import AppError from '../utils/appError.js';

export interface IAppointment extends Document {
	service: mongoose.Types.ObjectId;
	patient: mongoose.Types.ObjectId;
	doctor: mongoose.Types.ObjectId;
	date: Date;
	status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
	price: number;
	paid: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
	{
		service: {
			type: Schema.ObjectId,
			ref: 'Service',
			required: [true, 'Appointment must belong to a service'],
		},
		patient: {
			type: Schema.ObjectId,
			ref: 'User',
			required: [true, 'Appointment must belong to a patient'],
		},
		doctor: {
			type: Schema.ObjectId,
			ref: 'User',
			required: [true, 'Appointment must be assigned to a doctor'],
		},
		date: {
			type: Date,
			required: [true, 'Appointment must have a date and time'],
		},
		status: {
			type: String,
			enum: {
				values: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
				message:
					'Status must be PENDING, CONFIRMED, CANCELLED, or COMPLETED',
			},
			default: 'PENDING',
		},
		price: {
			type: Number,
			required: [true, 'Appointment must have a price'],
		},
		paid: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

appointmentSchema.pre(/^find/, function (next) {
	(this as mongoose.Query<IAppointment[], IAppointment>)
		.populate({
			path: 'patient',
			select: 'name email',
		})
		.populate({
			path: 'doctor',
			select: 'name email',
		})
		.populate({
			path: 'service',
			select: 'name category price duration',
		});
	next();
});

appointmentSchema.pre('save', async function (next) {
	// Lookup service duration to calculate the new appointment's time window
	const service = await mongoose
		.model('Service')
		.findById(this.service)
		.select('duration');
	const durationMs = ((service?.duration as number) || 30) * 60 * 1000;

	const newStart = new Date(this.date);
	const newEnd = new Date(newStart.getTime() + durationMs);

	// Find same-day appointments for this doctor that could potentially overlap
	const dayStart = new Date(newStart);
	dayStart.setHours(0, 0, 0, 0);
	const dayEnd = new Date(newStart);
	dayEnd.setHours(23, 59, 59, 999);

	const sameDayAppointments = await (
		this.constructor as mongoose.Model<IAppointment>
	).find({
		doctor: this.doctor,
		status: { $in: ['PENDING', 'CONFIRMED'] },
		_id: { $ne: this._id },
		date: { $gte: dayStart, $lte: dayEnd },
	});

	// Check each existing appointment for time overlap using its service duration
	for (const existing of sameDayAppointments) {
		const existingService = await mongoose
			.model('Service')
			.findById(existing.service)
			.select('duration');
		const existingDuration =
			((existingService?.duration as number) || 30) * 60 * 1000;

		const existingStart = new Date(existing.date);
		const existingEnd = new Date(existingStart.getTime() + existingDuration);

		// Two time ranges overlap if one starts before the other ends and vice versa
		if (newStart < existingEnd && newEnd > existingStart) {
			return next(
				new AppError(
					'Doctor already has an appointment during this time slot',
					400,
				),
			);
		}
	}

	next();
});

appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ service: 1 });
appointmentSchema.index({ status: 1, date: 1 });

const Appointment = mongoose.model<IAppointment>(
	'Appointment',
	appointmentSchema,
);

export default Appointment;
