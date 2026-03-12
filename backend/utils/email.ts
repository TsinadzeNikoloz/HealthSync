import nodemailer from 'nodemailer';

interface EmailUser {
	email: string;
	name: string;
}

export interface AppointmentEmailData {
	serviceName: string;
	doctorName: string;
	patientName: string;
	date: Date;
	price: number;
}

class Email {
	to: string;
	firstName: string;
	url: string;
	from: string;

	constructor(user: EmailUser, url: string = '') {
		this.to = user.email;
		this.firstName = user.name.split(' ')[0];
		this.url = url;
		this.from = `HealthSync <${process.env.EMAIL_FROM}>`;
	}

	newTransport() {
		return nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD,
			},
		});
	}

	async send(subject: string, html: string) {
		const mailOptions = {
			from: this.from,
			to: this.to,
			subject,
			html,
			text: html.replace(/<[^>]*>/g, ''),
		};

		await this.newTransport().sendMail(mailOptions);
	}

	private formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-GB', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	}

	private appointmentDetailsHtml(data: AppointmentEmailData): string {
		return `
			<table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
				<tr>
					<td style="padding: 12px 16px; background: #f8fafc; border-radius: 8px 8px 0 0; color: #64748b; font-size: 13px; font-weight: 600;">Service</td>
					<td style="padding: 12px 16px; background: #f8fafc; border-radius: 8px 8px 0 0; color: #1e293b; font-size: 14px; text-align: right;">${data.serviceName}</td>
				</tr>
				<tr>
					<td style="padding: 12px 16px; color: #64748b; font-size: 13px; font-weight: 600;">Doctor</td>
					<td style="padding: 12px 16px; color: #1e293b; font-size: 14px; text-align: right;">${data.doctorName}</td>
				</tr>
				<tr>
					<td style="padding: 12px 16px; background: #f8fafc; color: #64748b; font-size: 13px; font-weight: 600;">Date & Time</td>
					<td style="padding: 12px 16px; background: #f8fafc; color: #1e293b; font-size: 14px; text-align: right;">${this.formatDate(data.date)}</td>
				</tr>
				<tr>
					<td style="padding: 12px 16px; border-radius: 0 0 8px 8px; color: #64748b; font-size: 13px; font-weight: 600;">Amount Paid</td>
					<td style="padding: 12px 16px; border-radius: 0 0 8px 8px; color: #4f46e5; font-size: 14px; font-weight: 700; text-align: right;">€${data.price.toFixed(2)}</td>
				</tr>
			</table>
		`;
	}

	private wrapHtml(content: string): string {
		return `
			<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
				${content}
				<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
				<p style="color: #94a3b8; font-size: 12px;">— The HealthSync Team</p>
			</div>
		`;
	}

	async sendWelcome() {
		const html = this.wrapHtml(`
			<h1 style="color: #4f46e5;">Welcome to HealthSync, ${this.firstName}!</h1>
			<p style="color: #475569; font-size: 16px; line-height: 1.6;">
				We're excited to have you on board. Your account has been created successfully.
			</p>
		`);
		await this.send('Welcome to HealthSync!', html);
	}

	async sendPasswordReset() {
		const html = this.wrapHtml(`
			<h1 style="color: #4f46e5;">Password Reset</h1>
			<p style="color: #475569; font-size: 16px; line-height: 1.6;">
				Hi ${this.firstName}, you requested a password reset. Click the button below to set a new password.
			</p>
			<div style="text-align: center; margin: 32px 0;">
				<a href="${this.url}" style="background-color: #4f46e5; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
					Reset Password
				</a>
			</div>
			<p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
				If you didn't request this, please ignore this email. This link is valid for 10 minutes.
			</p>
			<p style="color: #94a3b8; font-size: 13px;">
				Or copy this link: <a href="${this.url}" style="color: #4f46e5;">${this.url}</a>
			</p>
		`);
		await this.send(
			'Your password reset token (valid for 10 minutes)',
			html,
		);
	}

	async sendBookingConfirmation(data: AppointmentEmailData) {
		const html = this.wrapHtml(`
			<h1 style="color: #4f46e5;">Booking Confirmed!</h1>
			<p style="color: #475569; font-size: 16px; line-height: 1.6;">
				Hi ${this.firstName}, your appointment has been booked successfully. Here are the details:
			</p>
			${this.appointmentDetailsHtml(data)}
			<p style="color: #475569; font-size: 14px; line-height: 1.6;">
				Your appointment is currently <strong style="color: #f59e0b;">pending</strong> and will be confirmed by your doctor shortly.
			</p>
		`);
		await this.send(`Booking Confirmed — ${data.serviceName}`, html);
	}

	async sendAppointmentConfirmed(data: AppointmentEmailData) {
		const html = this.wrapHtml(`
			<h1 style="color: #4f46e5;">Appointment Confirmed</h1>
			<p style="color: #475569; font-size: 16px; line-height: 1.6;">
				Hi ${this.firstName}, great news! Your appointment has been <strong style="color: #22c55e;">confirmed</strong> by your doctor.
			</p>
			${this.appointmentDetailsHtml(data)}
			<p style="color: #475569; font-size: 14px; line-height: 1.6;">
				Please arrive on time. If you need to make changes, visit your appointments dashboard.
			</p>
		`);
		await this.send('Your Appointment Has Been Confirmed', html);
	}

	async sendAppointmentCancelled(data: AppointmentEmailData) {
		const html = this.wrapHtml(`
			<h1 style="color: #ef4444;">Appointment Cancelled</h1>
			<p style="color: #475569; font-size: 16px; line-height: 1.6;">
				Hi ${this.firstName}, we're sorry to inform you that the following appointment has been cancelled.
			</p>
			${this.appointmentDetailsHtml(data)}
			<p style="color: #475569; font-size: 14px; line-height: 1.6;">
				If you have any questions, please don't hesitate to contact us. You can also book a new appointment through our platform.
			</p>
		`);
		await this.send('Appointment Cancelled', html);
	}

	async sendAppointmentCompleted(data: AppointmentEmailData) {
		const html = this.wrapHtml(`
			<h1 style="color: #4f46e5;">Appointment Completed</h1>
			<p style="color: #475569; font-size: 16px; line-height: 1.6;">
				Hi ${this.firstName}, your appointment has been marked as <strong style="color: #22c55e;">completed</strong>. We hope everything went well!
			</p>
			${this.appointmentDetailsHtml(data)}
			<p style="color: #475569; font-size: 14px; line-height: 1.6;">
				We'd love to hear about your experience. Consider leaving a review for the service to help other patients.
			</p>
		`);
		await this.send('Appointment Completed — Thank You!', html);
	}

	async sendOTP(code: string) {
		const html = this.wrapHtml(`
			<h1 style="color: #4f46e5;">Verification Code</h1>
			<p style="color: #475569; font-size: 16px; line-height: 1.6;">
				Hi ${this.firstName}, use the code below to complete your login.
			</p>
			<div style="text-align: center; margin: 32px 0;">
				<span style="display: inline-block; background: #f1f5f9; padding: 16px 40px; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${code}</span>
			</div>
			<p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
				This code expires in 10 minutes. If you didn't request this, please ignore this email.
			</p>
		`);
		await this.send('Your HealthSync Verification Code', html);
	}

	async sendContactMessage(senderName: string, senderEmail: string, subject: string, message: string) {
		const html = this.wrapHtml(`
			<h1 style="color: #4f46e5;">New Contact Message</h1>
			<table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
				<tr>
					<td style="padding: 12px 16px; background: #f8fafc; border-radius: 8px 8px 0 0; color: #64748b; font-size: 13px; font-weight: 600;">From</td>
					<td style="padding: 12px 16px; background: #f8fafc; color: #1e293b; font-size: 14px; text-align: right;">${senderName} &lt;${senderEmail}&gt;</td>
				</tr>
				<tr>
					<td style="padding: 12px 16px; color: #64748b; font-size: 13px; font-weight: 600;">Subject</td>
					<td style="padding: 12px 16px; color: #1e293b; font-size: 14px; text-align: right;">${subject}</td>
				</tr>
			</table>
			<p style="color: #475569; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
		`);
		await this.send(`[Contact] ${subject}`, html);
	}

	async sendAppointmentReminder(data: AppointmentEmailData) {
		const html = this.wrapHtml(`
			<h1 style="color: #4f46e5;">Appointment Reminder</h1>
			<p style="color: #475569; font-size: 16px; line-height: 1.6;">
				Hi ${this.firstName}, this is a reminder that you have an appointment scheduled in <strong>24 hours</strong>.
			</p>
			${this.appointmentDetailsHtml(data)}
			<p style="color: #475569; font-size: 14px; line-height: 1.6;">
				Please make sure to arrive on time. If you need to make any changes, visit your appointments dashboard.
			</p>
		`);
		await this.send(`Reminder: Appointment Tomorrow — ${data.serviceName}`, html);
	}

	async sendDoctorNewBooking(data: AppointmentEmailData) {
		const detailsHtml = `
			<table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
				<tr>
					<td style="padding: 12px 16px; background: #f8fafc; border-radius: 8px 8px 0 0; color: #64748b; font-size: 13px; font-weight: 600;">Patient</td>
					<td style="padding: 12px 16px; background: #f8fafc; border-radius: 8px 8px 0 0; color: #1e293b; font-size: 14px; text-align: right;">${data.patientName}</td>
				</tr>
				<tr>
					<td style="padding: 12px 16px; color: #64748b; font-size: 13px; font-weight: 600;">Service</td>
					<td style="padding: 12px 16px; color: #1e293b; font-size: 14px; text-align: right;">${data.serviceName}</td>
				</tr>
				<tr>
					<td style="padding: 12px 16px; background: #f8fafc; border-radius: 0 0 8px 8px; color: #64748b; font-size: 13px; font-weight: 600;">Date & Time</td>
					<td style="padding: 12px 16px; background: #f8fafc; border-radius: 0 0 8px 8px; color: #1e293b; font-size: 14px; text-align: right;">${this.formatDate(data.date)}</td>
				</tr>
			</table>
		`;
		const html = this.wrapHtml(`
			<h1 style="color: #4f46e5;">New Appointment Booked</h1>
			<p style="color: #475569; font-size: 16px; line-height: 1.6;">
				Hi Dr. ${this.firstName}, a new appointment has been booked with you.
			</p>
			${detailsHtml}
			<p style="color: #475569; font-size: 14px; line-height: 1.6;">
				Please review and confirm this appointment from your dashboard.
			</p>
		`);
		await this.send(`New Appointment — ${data.patientName}`, html);
	}
}

export default Email;
