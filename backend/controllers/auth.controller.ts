import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import User from '../models/user.model.js';
import type { IUser } from '../models/user.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import Email from '../utils/email.js';

const signToken = (id: string): string => {
	return jwt.sign(
		{ id },
		process.env.JWT_SECRET_KEY as string,
		{
			expiresIn: process.env.JWT_EXPIRES_IN as string,
		} as jwt.SignOptions,
	);
};

const createAndSendToken = (user: IUser, statusCode: number, res: Response) => {
	const token = signToken(user._id as string);

	const cookieOptions: {
		expires: Date;
		httpOnly: boolean;
		secure?: boolean;
	} = {
		expires: new Date(
			Date.now() +
				Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
		),
		httpOnly: true,
	};

	if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
	res.cookie('jwt', token, cookieOptions);

	user.password = undefined as unknown as string;

	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user,
		},
	});
};

// @desc        Sign up a new user and send jwt
// @route       POST /api/v1/users/signup
// @access      Public
export const signup = catchAsync(async (req: Request, res: Response) => {
	const userData: Record<string, unknown> = {
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
	};

	if (req.body.phone) userData.phone = req.body.phone;
	if (req.body.gender) userData.gender = req.body.gender;
	if (req.body.dateOfBirth) userData.dateOfBirth = req.body.dateOfBirth;
	if (req.body.address) userData.address = req.body.address;

	const newUser = await User.create(userData);
	try {
		const url = `${req.protocol}:/${req.get('host')}/me`;
		await new Email(newUser, url).sendWelcome();
	} catch {}

	createAndSendToken(newUser, 201, res);
});

// @desc        Log in user and return jwt
// @route       POST /api/v1/users/login
// @access      Public
export const login = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { email, password } = req.body;

		// 1) Check if email and password exist
		if (!email || !password) {
			return next(new AppError('Please provide email and password!', 400));
		}

		// 2) Check if user exists && Password is correct
		const user = await User.findOne({ email }).select('+password');

		if (!user || !(await user.correctPassword(password, user.password))) {
			return next(new AppError('Incorrect email or password', 401));
		}

		// 3) Check if account is active
		if (!user.isActive) {
			return next(
				new AppError(
					'Your account has been deactivated. Please contact support.',
					401,
				),
			);
		}

		// 4) If 2FA enabled, send OTP instead of token
		if (user.twoFactorEnabled) {
			const otp = user.createOTP();
			await user.save({ validateBeforeSave: false });

			try {
				await new Email(user).sendOTP(otp);
			} catch (err) {
				user.otpCode = undefined;
				user.otpExpires = undefined;
				await user.save({ validateBeforeSave: false });
				return next(
					new AppError(
						'Error sending verification code. Try again later!',
						500,
					),
				);
			}

			return res.status(200).json({
				status: 'pending',
				message: 'Verification code sent to your email',
			});
		}

		// 4) If no 2FA, send jwt token to client
		createAndSendToken(user, 200, res);
	},
);

// @desc        Log out user by clearing jwt cookie
// @route       GET /api/v1/users/logout
// @access      Public
export const logout = (_req: Request, res: Response) => {
	res.cookie('jwt', 'loggedout', {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});
	res.status(200).json({ status: 'success' });
};

// @desc        Verify OTP for two-factor authentication
// @route       POST /api/v1/users/verifyOTP
// @access      Public
export const verifyOTP = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { email, otp } = req.body;

		if (!email || !otp) {
			return next(
				new AppError('Please provide email and verification code', 400),
			);
		}

		const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

		const user = await User.findOne({
			email,
			otpCode: hashedOTP,
			otpExpires: { $gt: Date.now() },
		}).select('+otpCode');

		if (!user) {
			return next(new AppError('Invalid or expired verification code', 401));
		}

		// Clear OTP fields
		user.otpCode = undefined;
		user.otpExpires = undefined;
		await user.save({ validateBeforeSave: false });

		createAndSendToken(user, 200, res);
	},
);

// @desc        Protect routes, check jwt and user validity
// @route       Middleware (used before protected routes)
// @access      Private
export const jwtProtect = catchAsync(
	async (req: Request, _res: Response, next: NextFunction) => {
		// 1) Getting Token and checking if it's there
		let token: string | undefined;
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith('Bearer')
		) {
			token = req.headers.authorization.split(' ')[1];
		} else if (req.cookies.jwt) {
			token = req.cookies.jwt;
		}
		if (!token) {
			return next(
				new AppError('You are not logged in! Please log in to get access', 401),
			);
		}

		// 2) Verify token
		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET_KEY as string,
		) as jwt.JwtPayload;

		const currentUser = await User.findById(decoded.id);

		// 3) Check if User still exists and is active
		if (!currentUser) {
			return next(
				new AppError('The user belonging to this token no longer exists', 401),
			);
		}

		if (!currentUser.isActive) {
			return next(new AppError('Your account has been deactivated.', 401));
		}

		// 4) Check if User changed password after the token was issued
		if (currentUser.changedPasswordAfter(decoded.iat as number)) {
			return next(
				new AppError(
					'User recently changed password! Please log in again.',
					401,
				),
			);
		}

		// Grant access to protected route
		req.user = currentUser;
		next();
	},
);

// @desc        Check if user is logged in
// @route       Middleware
// @access      Public
// Only for rendered pages, no errors!
export const isLoggedIn = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (req.cookies.jwt) {
		try {
			const decoded = jwt.verify(
				req.cookies.jwt,
				process.env.JWT_SECRET_KEY as string,
			) as jwt.JwtPayload;

			const currentUser = await User.findById(decoded.id);

			if (!currentUser) {
				return next();
			}

			if (currentUser.changedPasswordAfter(decoded.iat as number)) {
				return next();
			}

			res.locals.user = currentUser;
			return next();
		} catch {
			return next();
		}
	}
	next();
};

export const restrictTo = (...roles: string[]) => {
	return (req: Request, _res: Response, next: NextFunction) => {
		if (!roles.includes(req.user!.role)) {
			return next(
				new AppError('You do not have permission to perform this action', 403),
			);
		}
		next();
	};
};

export const forgotPassword = catchAsync(
	async (req: Request, res: Response, _next: NextFunction) => {
		const user = await User.findOne({ email: req.body.email });

		if (user) {
			const resetToken = user.createResetPasswordToken();
			await user.save({ validateBeforeSave: false });

			const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

			try {
				await new Email(user, resetURL).sendPasswordReset();
			} catch (err) {
				console.error('Failed to send password reset email:', err);
				user.resetPasswordToken = undefined;
				user.resetPasswordExpires = undefined;
				await user.save({ validateBeforeSave: false });
			}
		}

		res.status(200).json({
			status: 'success',
			message: 'If that email is registered, a reset link has been sent.',
		});
	},
);

export const resetPassword = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const hashedToken = crypto
			.createHash('sha256')
			.update(req.params.token as string)
			.digest('hex');

		const user = await User.findOne({
			resetPasswordToken: hashedToken,
			resetPasswordExpires: { $gt: Date.now() },
		});

		if (!user) {
			return next(new AppError('Token is invalid or has expired', 400));
		}
		user.password = req.body.password;
		user.passwordConfirm = req.body.passwordConfirm;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		await user.save();

		createAndSendToken(user, 200, res);
	},
);

export const updatePassword = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = await User.findById(req.user!.id).select('+password');

		if (!user) {
			return next(new AppError('User not found', 404));
		}

		const { passwordCurrent, password, passwordConfirm } = req.body;

		if (!passwordCurrent || !password || !passwordConfirm) {
			return next(
				new AppError('Please provide current and new passwords', 400),
			);
		}

		const correct = await user.correctPassword(passwordCurrent, user.password);
		if (!correct) {
			return next(new AppError('Your current password is wrong', 401));
		}

		user.password = password;
		user.passwordConfirm = passwordConfirm;

		await user.save();

		createAndSendToken(user, 200, res);
	},
);
