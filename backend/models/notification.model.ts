import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
	user: mongoose.Types.ObjectId;
	message: string;
	type: 'appointment' | 'record' | 'system';
	link?: string;
	read: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
	{
		user: {
			type: Schema.ObjectId,
			ref: 'User',
			required: [true, 'Notification must belong to a user'],
		},
		message: {
			type: String,
			required: [true, 'Notification must have a message'],
			trim: true,
		},
		type: {
			type: String,
			enum: ['appointment', 'record', 'system'],
			default: 'system',
		},
		link: {
			type: String,
			trim: true,
		},
		read: {
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

notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model<INotification>(
	'Notification',
	notificationSchema,
);

export default Notification;
