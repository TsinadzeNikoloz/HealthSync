import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

// Helper: create admin user and return token
async function getAdminToken(): Promise<string> {
	const User = (await import('../models/user.model.js')).default;
	const admin = await User.create({
		name: 'Admin User',
		email: 'admin@example.com',
		password: 'Password123!',
		passwordConfirm: 'Password123!',
		role: 'ADMIN',
	});
	const res = await request(app)
		.post('/api/v1/users/login')
		.send({ email: 'admin@example.com', password: 'Password123!' });
	return res.body.token;
}

const validService = {
	name: 'General Checkup',
	duration: 30,
	category: 'CONSULTATION',
	price: 50,
	summary: 'A routine general health checkup for all patients.',
	imageCover: 'https://example.com/image.jpg',
};

describe('Services - Public access', () => {
	it('returns list of services without auth', async () => {
		const res = await request(app).get('/api/v1/services');

		expect(res.status).toBe(200);
		expect(res.body.status).toBe('success');
		expect(Array.isArray(res.body.data.docs)).toBe(true);
	});

	it('returns 404 for non-existent service slug', async () => {
		const res = await request(app).get('/api/v1/services/non-existent-slug');

		expect(res.status).toBe(404);
	});
});

describe('Services - Admin CRUD', () => {
	it('creates a service and auto-generates slug', async () => {
		const token = await getAdminToken();

		const res = await request(app)
			.post('/api/v1/services')
			.set('Authorization', `Bearer ${token}`)
			.send(validService);

		expect(res.status).toBe(201);
		expect(res.body.data.doc.slug).toBe('general-checkup');
	});

	it('fetches a service by slug', async () => {
		const token = await getAdminToken();
		await request(app)
			.post('/api/v1/services')
			.set('Authorization', `Bearer ${token}`)
			.send(validService);

		const res = await request(app).get('/api/v1/services/general-checkup');

		expect(res.status).toBe(200);
		expect(res.body.data.doc.name).toBe('General Checkup');
	});

	it('blocks non-admin from creating a service', async () => {
		const signupRes = await request(app).post('/api/v1/users/signup').send({
			name: 'Regular User',
			email: 'user@example.com',
			password: 'Password123!',
			passwordConfirm: 'Password123!',
		});
		const token = signupRes.body.token;

		const res = await request(app)
			.post('/api/v1/services')
			.set('Authorization', `Bearer ${token}`)
			.send(validService);

		expect(res.status).toBe(403);
	});
});
