import type { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError.js';

interface MongoError extends Error {
	statusCode?: number;
	status?: string;
	isOperational?: boolean;
	path?: string;
	value?: string;
	keyValue?: Record<string, unknown>;
	errmsg?: string;
	code?: number;
	errors?: Record<string, { message: string }>;
}

const handleCastErrorDB = (err: MongoError) => {
	const message = `Invalid ${err.path}: ${err.value}`;
	return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: MongoError) => {
	const field = err.keyValue ? Object.keys(err.keyValue)[0] : null;
	let message = 'An account with these details already exists. Please try another.';
	if (field === 'email') {
		message = 'An account with this email already exists. Please log in or use a different email.';
	}
	return new AppError(message, 400);
};

const handleValidationErrorDB = (err: MongoError) => {
	const errors = Object.values(err.errors!).map((el) => el.message);
	const message = `Invalid input data. ${errors.join('. ')}`;
	return new AppError(message, 400);
};

const handleJWTError = () =>
	new AppError('Invalid Token, Please log in again', 401);

const handleJWTExpiredError = () =>
	new AppError('Your Token has expired, Please log in again', 401);

const sendErrorDev = (err: AppError, _req: Request, res: Response) => {
	return res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
	});
};

const sendErrorProd = (err: AppError, _req: Request, res: Response) => {
	if (err.isOperational) {
		return res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	}
	console.error('Unhandled error:', err);
	return res.status(500).json({
		status: 'error',
		message: 'Something went wrong',
	});
};

const globalErrorHandler = (
	err: MongoError & AppError,
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		let error = { ...err } as MongoError & AppError;
		error.message = err.message;
		error.name = err.name;

		if (error.name === 'CastError') error = handleCastErrorDB(error) as any;
		if (error.code === 11000) error = handleDuplicateFieldsDB(error) as any;
		if (error.name === 'ValidationError')
			error = handleValidationErrorDB(error) as any;

		sendErrorDev(error, req, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = { ...err } as MongoError & AppError;
		error.message = err.message;
		error.name = err.name;

		if (error.name === 'CastError') error = handleCastErrorDB(error) as any;
		if (error.code === 11000)
			error = handleDuplicateFieldsDB(error) as any;
		if (error.name === 'ValidationError')
			error = handleValidationErrorDB(error) as any;
		if (error.name === 'JsonWebTokenError') error = handleJWTError() as any;
		if (error.name === 'TokenExpiredError')
			error = handleJWTExpiredError() as any;

		sendErrorProd(error, req, res);
	}
};

export default globalErrorHandler;
