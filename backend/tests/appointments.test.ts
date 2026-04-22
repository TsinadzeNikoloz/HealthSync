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

// Services require admin - create admin and use their token
async function createService() {
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

	const res = await request(app)
		.post('/api/v1/services')
		.set('Authorization', `Bearer ${adminToken}`)
		.send({
			name: 'Test Service',
			duration: 60,
			category: 'CONSULTATION',
			price: 100,
			summary: 'Test service summary',
			imageCover: 'https://example.com/image.jpg',
		});
	return res.body.data.doc._id as string;
}

describe('Appointments - Access control', () => {
	it('blocks patients from GET /appointments (staff only)', async () => {
		const { token } = await createPatient();
		const res = await request(app)
			.get('/api/v1/appointments')
			.set('Authorization', `Bearer ${token}`);
		expect(res.status).toBe(403);
	});

	it('allows patients to GET /my-appointments', async () => {
		const { token } = await createPatient();
		const res = await request(app)
			.get('/api/v1/appointments/my-appointments')
			.set('Authorization', `Bearer ${token}`);
		expect(res.status).toBe(200);
	});
});

describe('Appointments - Creation', () => {
	it('doctor can create an appointment', async () => {
		const { token: doctorToken, id: doctorId } = await createDoctor();
		const { id: patientId } = await createPatient();
		const serviceId = await createService();

		const res = await request(app)
			.post('/api/v1/appointments')
			.set('Authorization', `Bearer ${doctorToken}`)
			.send({
				service: serviceId,
				patient: patientId,
				doctor: doctorId,
				date: '2027-06-01T09:00:00.000Z',
				price: 100,
			});

		expect(res.status).toBe(201);
		expect(res.body.data.doc.status).toBe('PENDING');
	});

	it('rejects double-booking the same doctor at overlapping times', async () => {
		const { token: doctorToken, id: doctorId } = await createDoctor();
		const { id: patientId } = await createPatient();
		const serviceId = await createService();

		const appointmentData = {
			service: serviceId,
			patient: patientId,
			doctor: doctorId,
			date: '2027-06-02T09:00:00.000Z',
			price: 100,
		};

		// First booking succeeds
		await request(app)
			.post('/api/v1/appointments')
			.set('Authorization', `Bearer ${doctorToken}`)
			.send(appointmentData);

		// Second booking at the same time should fail
		const res = await request(app)
			.post('/api/v1/appointments')
			.set('Authorization', `Bearer ${doctorToken}`)
			.send(appointmentData);

		expect(res.status).toBe(400);
	});
});
