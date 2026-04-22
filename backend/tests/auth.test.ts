import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

const validUser = {
	name: 'Test User',
	email: 'test@example.com',
	password: 'Password123!',
	passwordConfirm: 'Password123!',
};

describe('Auth - Signup', () => {
	it('creates a new user and returns a token', async () => {
		const res = await request(app).post('/api/v1/users/signup').send(validUser);

		expect(res.status).toBe(201);
		expect(res.body.status).toBe('success');
		expect(res.body.token).toBeDefined();
		expect(res.body.data.user.email).toBe(validUser.email);
		expect(res.body.data.user.password).toBeUndefined(); // never exposed
	});

	it('rejects signup with mismatched passwords', async () => {
		const res = await request(app)
			.post('/api/v1/users/signup')
			.send({ ...validUser, passwordConfirm: 'wrongpassword' });

		expect(res.status).toBe(400);
	});

	it('rejects signup with duplicate email', async () => {
		await request(app).post('/api/v1/users/signup').send(validUser);
		const res = await request(app).post('/api/v1/users/signup').send(validUser);

		expect(res.status).toBe(400);
	});
});

describe('Auth - Login', () => {
	it('returns a token with valid credentials', async () => {
		await request(app).post('/api/v1/users/signup').send(validUser);

		const res = await request(app)
			.post('/api/v1/users/login')
			.send({ email: validUser.email, password: validUser.password });

		expect(res.status).toBe(200);
		expect(res.body.token).toBeDefined();
	});

	it('rejects login with wrong password', async () => {
		await request(app).post('/api/v1/users/signup').send(validUser);

		const res = await request(app)
			.post('/api/v1/users/login')
			.send({ email: validUser.email, password: 'wrongpassword' });

		expect(res.status).toBe(401);
	});

	it('rejects login with non-existent email', async () => {
		const res = await request(app)
			.post('/api/v1/users/login')
			.send({ email: 'nobody@example.com', password: 'password123' });

		expect(res.status).toBe(401);
	});
});

describe('Auth - Protected routes', () => {
	it('blocks access to protected route without token', async () => {
		const res = await request(app).get('/api/v1/appointments');

		expect(res.status).toBe(401);
	});

	it('allows access to protected route with valid token', async () => {
		await request(app).post('/api/v1/users/signup').send(validUser);
		const loginRes = await request(app)
			.post('/api/v1/users/login')
			.send({ email: validUser.email, password: validUser.password });

		const token = loginRes.body.token;

		const res = await request(app)
			.get('/api/v1/appointments/my-appointments')
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
	});
});
