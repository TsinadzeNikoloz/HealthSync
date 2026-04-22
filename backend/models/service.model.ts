import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
	name: string;
	slug: string;
	duration: number;
	category: 'CONSULTATION' | 'TREATMENT' | 'DIAGNOSTIC' | 'THERAPY' | 'SURGERY';
	ratingsAverage: number;
	ratingsQuantity: number;
	price: number;
	priceDiscount?: number;
	summary: string;
	description?: string;
	imageCover: string;
	doctors: mongoose.Types.ObjectId[];
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
	{
		name: {
			type: String,
			required: [true, 'A service must have a name'],
			unique: true,
			trim: true,
			maxlength: [
				40,
				'A service name must have less than or equal to 40 characters',
			],
			minlength: [
				5,
				'A service name must have greater than or equal to 5 characters',
			],
		},
		slug: {
			type: String,
			unique: true,
		},
		duration: {
			type: Number,
			required: [true, 'A service must have a duration'],
		},
		category: {
			type: String,
			required: [true, 'A service must have a category'],
			enum: {
				values: [
					'CONSULTATION',
					'TREATMENT',
					'DIAGNOSTIC',
					'THERAPY',
					'SURGERY',
				],
				message:
					'Category must be one of: CONSULTATION, TREATMENT, DIAGNOSTIC, THERAPY, SURGERY',
			},
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, 'Rating must be above 1.0'],
			max: [5, 'Rating must be below 5'],
			set: (val: number) => Math.round(val * 10) / 10,
		},
		ratingsQuantity: {
			type: Number,
			default: 0,
		},
		price: {
			type: Number,
			required: [true, 'A service must have a price'],
		},
		priceDiscount: {
			type: Number,
			validate: {
				validator: function (this: IService, val: number) {
					return val < this.price;
				},
				message: 'Discount price should be below regular price',
			},
		},
		summary: {
			type: String,
			trim: true,
			required: [true, 'A service must have a summary'],
		},
		description: {
			type: String,
			trim: true,
		},
		imageCover: {
			type: String,
			required: [true, 'A service must have a cover image'],
		},
		doctors: [
			{
				type: Schema.ObjectId,
				ref: 'User',
			},
		],
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

serviceSchema.pre('save', function (next) {
	if (this.isModified('name') || !this.slug) {
		this.slug = this.name
			.toLowerCase()
			.trim()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '');
	}
	next();
});

serviceSchema.index({ price: 1, ratingsAverage: -1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });

serviceSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'service',
	localField: '_id',
});

serviceSchema.pre(/^find/, function (next) {
	(this as mongoose.Query<IService[], IService>).populate({
		path: 'doctors',
		select: 'name email photo specialty',
	});
	next();
});

const Service = mongoose.model<IService>('Service', serviceSchema);

export default Service;
