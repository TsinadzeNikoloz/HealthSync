import express from 'express';
import * as medicalRecordController from '../controllers/medicalRecord.controller.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authController.jwtProtect);

// Special routes for getting medical records by patient or appointment
router.get(
	'/patient/:patientId',
	authController.restrictTo('ADMIN', 'DOCTOR'),
	medicalRecordController.getPatientMedicalRecords,
);

router.get(
	'/appointment/:appointmentId',
	authController.restrictTo('ADMIN', 'DOCTOR'),
	medicalRecordController.getMedicalRecordByAppointment,
);

// GET / is accessible to patients too (they see their own records)
router
	.route('/')
	.get(medicalRecordController.getMedicalRecords)
	.post(
		authController.restrictTo('ADMIN', 'DOCTOR'),
		medicalRecordController.createMedicalRecord,
	);

router
	.route('/:id')
	.get(authController.restrictTo('ADMIN', 'DOCTOR'), medicalRecordController.getMedicalRecord)
	.patch(authController.restrictTo('ADMIN', 'DOCTOR'), medicalRecordController.updateMedicalRecord)
	.delete(
		authController.restrictTo('ADMIN'),
		medicalRecordController.deleteMedicalRecord,
	);

export default router;
