import mongoose, { Document, Model, Schema } from 'mongoose';
import crypto from 'crypto';
import validator from 'validator';
import bcrypt from 'bcryptjs';

export interface IAvailabilitySlot {
	dayOfWeek: number; // 0=Sunday … 6=Saturday
	startTime: string; // "09:00"
	endTime: string; // "17:00"
}

export interface IUser extends Document {
	name: string;
	email: string;
	photo: string;
	phone?: string;
	gender?: 'male' | 'female' | 'undisclosed';
	dateOfBirth?: Date;
	address?: string;
	role: 'USER' | 'DOCTOR' | 'ADMIN';
	specialty?: string;
	bio?: string;
	password: string;
	passwordConfirm: string | undefined;
	passwordChangedAt?: Date;
	resetPasswordToken?: string;
	resetPasswordExpires?: Date;
	twoFactorEnabled: boolean;
	otpCode?: string;
	otpExpires?: Date;
	isActive: boolean;
	availability?: IAvailabilitySlot[];
	correctPassword(
		candidatePassword: string,
		userPassword: string,
	): Promise<boolean>;
	changedPasswordAfter(JWTTimestamp: number): boolean;
	createResetPasswordToken(): string;
	createOTP(): string;
}

interface IUserModel extends Model<IUser> {}

const userSchema = new Schema<IUser, IUserModel>(
	{
		name: {
			type: String,
			required: [true, 'Please enter your name'],
			trim: true,
			minLength: 3,
			maxLength: 40,
		},
		email: {
			type: String,
			required: [true, 'Please enter your email'],
			unique: true,
			lowercase: true,
			validate: [validator.isEmail, 'Please enter a valid email'],
		},
		phone: {
			type: String,
			trim: true,
			validate: {
				validator: (v: string) => !v || validator.isMobilePhone(v),
				message: 'Please provide a valid phone number',
			},
		},
		gender: {
			type: String,
			enum: ['male', 'female', 'undisclosed'],
			default: 'undisclosed',
		},
		dateOfBirth: Date,
		address: {
			type: String,
			trim: true,
		},
		photo: {
			type: String,
			default: 'default.jpg',
		},
		role: {
			type: String,
			enum: ['USER', 'DOCTOR', 'ADMIN'],
			default: 'USER',
		},
		specialty: {
			type: String,
			trim: true,
		},
		bio: {
			type: String,
			trim: true,
			maxLength: 500,
		},
		password: {
			type: String,
			required: [true, 'Please enter a password'],
			minLength: [8, 'Password must be at least 8 characters'],
			select: false,
			validate: {
				validator: (val: string) =>
					validator.isStrongPassword(val, {
						minLength: 8,
						minLowercase: 1,
						minUppercase: 1,
						minNumbers: 1,
						minSymbols: 1,
					}),
				message:
					'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character',
			},
		},
		passwordConfirm: {
			type: String,
			required: [true, 'Please enter password again'],
			minLength: [8, 'Password must be at least 8 characters'],
			validate: {
				validator: function (this: IUser, el: string) {
					return el === this.password;
				},
				message: 'Passwords must be the same',
			},
		},
		passwordChangedAt: Date,
		resetPasswordToken: String,
		resetPasswordExpires: Date,
		twoFactorEnabled: {
			type: Boolean,
			default: false,
		},
		otpCode: {
			type: String,
			select: false,
		},
		otpExpires: Date,
		isActive: {
			type: Boolean,
			default: true,
		},
		availability: [
			{
				dayOfWeek: {
					type: Number,
					required: true,
					min: 0,
					max: 6,
				},
				startTime: {
					type: String,
					required: true,
					match: [/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'],
				},
				endTime: {
					type: String,
					required: true,
					match: [/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'],
				},
			},
		],
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		return next();
	}

	this.password = await bcrypt.hash(this.password, 12);
	this.passwordConfirm = undefined;
	next();
});

userSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew) return next();

	this.passwordChangedAt = new Date(Date.now() - 1000);
	next();
});

userSchema.methods.correctPassword = async function (
	candidatePassword: string,
	userPassword: string,
): Promise<boolean> {
	return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (
	JWTTimestamp: number,
): boolean {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(
			String(this.passwordChangedAt.getTime() / 1000),
			10,
		);
		return JWTTimestamp < changedTimestamp;
	}
	// False means NOT changed
	return false;
};

userSchema.methods.createOTP = function (): string {
	const otp = Math.floor(100000 + Math.random() * 900000).toString();

	this.otpCode = crypto.createHash('sha256').update(otp).digest('hex');
	this.otpExpires = new Date(Date.now() + 10 * 60 * 1000);

	return otp;
};

userSchema.methods.createResetPasswordToken = function (): string {
	const resetToken = crypto.randomBytes(32).toString('hex');

	this.resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);

	return resetToken;
};

const User = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
