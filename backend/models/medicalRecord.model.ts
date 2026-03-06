import mongoose, { Document, Schema } from 'mongoose';

export interface IMedicalRecord extends Document {
	patient: mongoose.Types.ObjectId;
	doctor: mongoose.Types.ObjectId;
	appointment: mongoose.Types.ObjectId;
	diagnosis: string;
	prescription?: string;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

const medicalRecordSchema = new Schema<IMedicalRecord>(
	{
		patient: {
			type: Schema.ObjectId,
			ref: 'User',
			required: [true, 'Medical record must belong to a patient'],
		},
		doctor: {
			type: Schema.ObjectId,
			ref: 'User',
			required: [true, 'Medical record must be created by a doctor'],
		},
		appointment: {
			type: Schema.ObjectId,
			ref: 'Appointment',
			required: [true, 'Medical record must be linked to an appointment'],
			unique: true,
		},
		diagnosis: {
			type: String,
			required: [true, 'Medical record must include a diagnosis'],
			trim: true,
		},
		prescription: {
			type: String,
			trim: true,
		},
		notes: {
			type: String,
			trim: true,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

medicalRecordSchema.pre(/^find/, function (next) {
	(this as mongoose.Query<IMedicalRecord[], IMedicalRecord>)
		.populate({
			path: 'patient',
			select: 'name email',
		})
		.populate({
			path: 'doctor',
			select: 'name email',
		})
		.populate({
			path: 'appointment',
			select: 'service date status',
			populate: {
				path: 'service',
				select: 'name category',
			},
		});
	next();
});

medicalRecordSchema.index({ patient: 1 });
medicalRecordSchema.index({ doctor: 1 });
medicalRecordSchema.index({ createdAt: -1 });

const MedicalRecord = mongoose.model<IMedicalRecord>(
	'MedicalRecord',
	medicalRecordSchema,
);

export default MedicalRecord;
