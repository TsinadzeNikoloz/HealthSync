import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { xss } from 'express-xss-sanitizer';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';

import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/error.controller.js';
import serviceRouter from './routes/service.routes.js';
import userRouter from './routes/user.routes.js';
import reviewRouter from './routes/review.routes.js';
import appointmentRouter from './routes/appointment.routes.js';
import medicalRecordRouter from './routes/medicalRecord.routes.js';
import notificationRouter from './routes/notification.routes.js';
import contactRouter from './routes/contact.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1) Global Middlewares
// Serving Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
if (process.env.NODE_ENV === 'production') {
	app.use(helmet());
}

// Development Logging
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// Limiting the amount of requests a user can make
const limiter = rateLimit({
	max: process.env.NODE_ENV === 'development' ? 10000 : 300,
	windowMs: 60 * 60 * 1000,
	message: 'Too many request from this IP, please try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Test Middleware
app.use((req, _res, next) => {
	req.requestTime = new Date().toISOString();
	next();
});

// 3) ROUTES
app.use('/api/v1/services', serviceRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/appointments', appointmentRouter);
app.use('/api/v1/medical-records', medicalRecordRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/contact', contactRouter);

app.all('*', (req, _res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this Server`, 404));
});

app.use(globalErrorHandler);

export default app;
