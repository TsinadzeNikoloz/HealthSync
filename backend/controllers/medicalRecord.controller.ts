import type { Request, Response, NextFunction } from 'express';
import MedicalRecord from '../models/medicalRecord.model.js';
import * as factory from './handlerFactory.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';
import { createNotification } from './notification.controller.js';

/** @desc    Get all medical records (admin sees all, doctor sees own)
 *  @route   GET /api/v1/medical-records
 *  @access  Private (Admin, Doctor) */
export const getMedicalRecords = catchAsync(
	async (req: Request, res: Response) => {
		const baseFilter =
			req.user!.role === 'DOCTOR'
				? { doctor: req.user!.id }
				: req.user!.role === 'USER'
					? { patient: req.user!.id }
					: {};

		const countFeatures = new APIFeatures(
			MedicalRecord.find(baseFilter),
			req.query,
		)
			.search(['diagnosis'])
			.filter();
		const totalCount = await MedicalRecord.countDocuments(
			countFeatures.query.getFilter(),
		);

		const features = new APIFeatures(MedicalRecord.find(baseFilter), req.query)
			.search(['diagnosis'])
			.filter()
			.sort()
			.limitFields()
			.paginate();
		const docs = await features.query;

		res.status(200).json({
			status: 'success',
			results: totalCount,
			data: { docs },
		});
	},
);

/** @desc    Get single medical record by ID
 *  @route   GET /api/v1/medical-records/:id
 *  @access  Private (Admin, Doctor) */
export const getMedicalRecord = factory.getOne(MedicalRecord);

/** @desc    Create new medical record
 *  @route   POST /api/v1/medical-records
 *  @access  Private (Doctor, Admin) */
export const createMedicalRecord = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const existingRecord = await MedicalRecord.findOne({
			appointment: req.body.appointment,
		});

		if (existingRecord) {
			return next(
				new AppError(
					'A medical record already exists for this appointment',
					400,
				),
			);
		}

		if (req.user!.role === 'DOCTOR' && !req.body.doctor) {
			req.body.doctor = req.user!.id;
		}

		const medicalRecord = await MedicalRecord.create(req.body);

		// Notify patient that a new record was added
		createNotification(
			medicalRecord.patient.toString(),
			'A new medical record has been added to your health profile.',
			'record',
			'/medical-records',
		);

		res.status(201).json({
			status: 'success',
			data: {
				medicalRecord,
			},
		});
	},
);

/** @desc    Update medical record
 *  @route   PATCH /api/v1/medical-records/:id
 *  @access  Private (Doctor, Admin) */
export const updateMedicalRecord = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		if (req.body.patient || req.body.doctor || req.body.appointment) {
			return next(
				new AppError(
					'Cannot modify patient, doctor, or appointment after medical record creation',
					400,
				),
			);
		}

		const medicalRecord = await MedicalRecord.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
				runValidators: true,
			},
		);

		if (!medicalRecord) {
			return next(new AppError('No medical record found with that ID', 404));
		}

		res.status(200).json({
			status: 'success',
			data: {
				medicalRecord,
			},
		});
	},
);

/** @desc    Delete medical record
 *  @route   DELETE /api/v1/medical-records/:id
 *  @access  Private (Admin only) */
export const deleteMedicalRecord = factory.deleteOne(MedicalRecord);

/** @desc    Get medical records by patient ID
 *  @route   GET /api/v1/medical-records/patient/:patientId
 *  @access  Private (Doctor, Admin, Patient self) */
export const getPatientMedicalRecords = catchAsync(
	async (req: Request, res: Response) => {
		const medicalRecords = await MedicalRecord.find({
			patient: req.params.patientId,
		}).sort('-createdAt');

		res.status(200).json({
			status: 'success',
			results: medicalRecords.length,
			data: {
				medicalRecords,
			},
		});
	},
);

/** @desc    Get medical record by appointment ID
 *  @route   GET /api/v1/medical-records/appointment/:appointmentId
 *  @access  Private (Doctor, Admin) */
export const getMedicalRecordByAppointment = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const medicalRecord = await MedicalRecord.findOne({
			appointment: req.params.appointmentId,
		});

		if (!medicalRecord) {
			return next(
				new AppError('No medical record found for this appointment', 404),
			);
		}

		res.status(200).json({
			status: 'success',
			data: {
				medicalRecord,
			},
		});
	},
);
