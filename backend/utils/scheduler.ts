import cron from 'node-cron';
import Appointment from '../models/appointment.model.js';
import Email from './email.js';
import type { AppointmentEmailData } from './email.js';
import chalk from 'chalk';

interface PopulatedUser {
	_id: string;
	name: string;
	email: string;
}

interface PopulatedService {
	_id: string;
	name: string;
	price: number;
}

// Runs every hour - finds appointments happening in 24h and sends reminders
export function startScheduler() {
	cron.schedule('0 * * * *', async () => {
		try {
			const now = new Date();
			const from = new Date(now.getTime() + 23 * 60 * 60 * 1000);
			const to = new Date(now.getTime() + 25 * 60 * 60 * 1000);

			const appointments = await Appointment.find({
				date: { $gte: from, $lte: to },
				status: { $in: ['PENDING', 'CONFIRMED'] },
			});

			for (const appointment of appointments) {
				const patient = appointment.patient as unknown as PopulatedUser;
				const doctor = appointment.doctor as unknown as PopulatedUser;
				const service = appointment.service as unknown as PopulatedService;

				if (!patient?.email || !doctor?.email || !service?.name) continue;

				const emailData: AppointmentEmailData = {
					serviceName: service.name,
					doctorName: doctor.name,
					patientName: patient.name,
					date: appointment.date,
					price: appointment.price,
				};

				new Email(patient).sendAppointmentReminder(emailData).catch(() => {});
				new Email(doctor).sendAppointmentReminder(emailData).catch(() => {});
			}

			if (appointments.length > 0) {
				console.log(
					chalk.bold.yellow(`[Scheduler] Sent reminders for ${appointments.length} appointment(s)`),
				);
			}
		} catch (err) {
			console.error(chalk.bold.redBright('[Scheduler] Reminder job failed:'), err);
		}
	});

	console.log(
		chalk.bold.greenBright('[Scheduler] Appointment reminder cron started (runs every hour)'),
	);
}
