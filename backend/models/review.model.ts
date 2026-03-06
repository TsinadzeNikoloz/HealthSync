import mongoose, { Document, Model, Schema } from 'mongoose';
import Service from './service.model.js';

export interface IReview extends Document {
	review: string;
	rating: number;
	user: mongoose.Types.ObjectId;
	service: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

interface IReviewModel extends Model<IReview> {
	calcAverageRatings(serviceId: mongoose.Types.ObjectId): Promise<void>;
}

const reviewSchema = new Schema<IReview, IReviewModel>(
	{
		review: {
			type: String,
			required: [true, 'A review must have text'],
			trim: true,
			maxLength: [500, 'A review must have less than or equal to 500 characters'],
		},
		rating: {
			type: Number,
			required: [true, 'A review must have a rating'],
			min: 1,
			max: 5,
		},
		user: {
			type: Schema.ObjectId,
			ref: 'User',
			required: [true, 'Review must belong to a user'],
		},
		service: {
			type: Schema.ObjectId,
			ref: 'Service',
			required: [true, 'Review must belong to a service'],
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

reviewSchema.index({ service: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
	(this as mongoose.Query<IReview[], IReview>).populate({
		path: 'user',
		select: 'name photo',
	});
	next();
});

// Calculating Average rating and rating quantity
reviewSchema.statics.calcAverageRatings = async function (
	serviceId: mongoose.Types.ObjectId,
) {
	const stats = await this.aggregate([
		{
			$match: { service: serviceId },
		},
		{
			$group: {
				_id: '$service',
				nRating: { $sum: 1 },
				avgRating: { $avg: '$rating' },
			},
		},
	]);

	if (stats.length > 0) {
		await Service.findByIdAndUpdate(serviceId, {
			ratingsQuantity: stats[0].nRating,
			ratingsAverage: stats[0].avgRating,
		});
	} else {
		await Service.findByIdAndUpdate(serviceId, {
			ratingsQuantity: 0,
			ratingsAverage: 4.5,
		});
	}
};

reviewSchema.post('save', function () {
	(this.constructor as IReviewModel).calcAverageRatings(this.service);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
	const query = this as mongoose.Query<IReview | null, IReview> & {
		r?: IReview | null;
	};
	query.r = await query.model.findOne(query.getQuery());
	next();
});

reviewSchema.post(/^findOneAnd/, async function () {
	const query = this as unknown as { r?: IReview | null };
	if (query.r) {
		await (query.r.constructor as IReviewModel).calcAverageRatings(
			query.r.service,
		);
	}
});

const Review = mongoose.model<IReview, IReviewModel>('Review', reviewSchema);

export default Review;
