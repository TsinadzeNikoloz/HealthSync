import { describe, it, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';

async function createDoctor() {
	const User = (await import('../models/user.model.js')).default;
	const doctor = await User.create({
		name: 'Dr. Test',
		email: 'doctor@example.com',
		password: 'Password123!',
		passwordConfirm: 'Password123!',
		role: 'DOCTOR',
	});
	const res = await request(app)
		.post('/api/v1/users/login')
		.send({ email: 'doctor@example.com', password: 'Password123!' });
	return { token: res.body.token as string, id: doctor._id as mongoose.Types.ObjectId };
}

async function createPatient() {
	const res = await request(app).post('/api/v1/users/signup').send({
		name: 'Patient User',
		email: 'patient@example.com',
		password: 'Password123!',
		passwordConfirm: 'Password123!',
	});
	return { token: res.body.token as string, id: res.body.data.user._id as string };
}

// Creates a service (admin-only) + appointment and returns the appointment id
async function createAppointment(doctorToken: string, doctorId: mongoose.Types.ObjectId, patientId: string) {
	const User = (await import('../models/user.model.js')).default;
	await User.create({
		name: 'Admin',
		email: 'admin@example.com',
		password: 'Password123!',
		passwordConfirm: 'Password123!',
		role: 'ADMIN',
	});
	const loginRes = await request(app)
		.post('/api/v1/users/login')
		.send({ email: 'admin@example.com', password: 'Password123!' });
	const adminToken = loginRes.body.token as string;

	const serviceRes = await request(app)
		.post('/api/v1/services')
		.set('Authorization', `Bearer ${adminToken}`)
		.send({
			name: 'Test Service',
			duration: 30,
			category: 'CONSULTATION',
			price: 80,
			summary: 'Test',
			imageCover: 'https://example.com/image.jpg',
		});
	const serviceId = serviceRes.body.data.doc._id;

	const apptRes = await request(app)
		.post('/api/v1/appointments')
		.set('Authorization', `Bearer ${doctorToken}`)
		.send({
			service: serviceId,
			patient: patientId,
			doctor: doctorId,
			date: '2027-07-01T10:00:00.000Z',
			price: 80,
		});
	return apptRes.body.data.doc._id as string;
}

describe('Medical Records - Access control', () => {
	it('patient can view their own records', async () => {
		const { token } = await createPatient();
		const res = await request(app)
			.get('/api/v1/medical-records')
			.set('Authorization', `Bearer ${token}`);
		expect(res.status).toBe(200);
	});

	it('patient cannot create a medical record', async () => {
		const { token, id: patientId } = await createPatient();
		const res = await request(app)
			.post('/api/v1/medical-records')
			.set('Authorization', `Bearer ${token}`)
			.send({
				patient: patientId,
				doctor: new mongoose.Types.ObjectId(),
				appointment: new mongoose.Types.ObjectId(),
				diagnosis: 'Test diagnosis',
			});
		expect(res.status).toBe(403);
	});
});

describe('Medical Records - Creation', () => {
	it('doctor can create a medical record linked to an appointment', async () => {
		const { token: doctorToken, id: doctorId } = await createDoctor();
		const { id: patientId } = await createPatient();
		const appointmentId = await createAppointment(doctorToken, doctorId, patientId);

		const res = await request(app)
			.post('/api/v1/medical-records')
			.set('Authorization', `Bearer ${doctorToken}`)
			.send({
				patient: patientId,
				doctor: doctorId,
				appointment: appointmentId,
				diagnosis: 'Hypertension stage 1',
				prescription: 'Lisinopril 10mg daily',
			});

		expect(res.status).toBe(201);
		expect(res.body.data.doc.diagnosis).toBe('Hypertension stage 1');
	});
});
