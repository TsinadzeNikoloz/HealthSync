import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import Email from '../utils/email.js';

export const sendContact = catchAsync(async (req, res, next) => {
	const { name, email, subject, message } = req.body;

	if (!name || !email || !subject || !message) {
		return next(new AppError('Please provide name, email, subject, and message.', 400));
	}

	await new Email(
		{ name: 'HealthSync Support', email: process.env.EMAIL_FROM! },
	).sendContactMessage(name, email, subject, message);

	res.status(200).json({ status: 'success', message: 'Message sent successfully.' });
});
