import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

const adminUser = {
	name: 'Admin User',
	email: 'admin@example.com',
	password: 'Password123!',
	passwordConfirm: 'Password123!',
};

const regularUser = {
	name: 'Regular User',
	email: 'user@example.com',
	password: 'Password123!',
	passwordConfirm: 'Password123!',
};

async function getAdminToken(): Promise<string> {
	const User = (await import('../models/user.model.js')).default;
	await User.create({ ...adminUser, role: 'ADMIN' });
	const res = await request(app)
		.post('/api/v1/users/login')
		.send({ email: adminUser.email, password: adminUser.password });
	return res.body.token;
}

describe('Users - Delete', () => {
	it('admin can delete another user', async () => {
		const adminToken = await getAdminToken();

		// Create a regular user to delete
		const signupRes = await request(app)
			.post('/api/v1/users/signup')
			.send(regularUser);
		const userId = signupRes.body.data.user._id;

		const res = await request(app)
			.delete(`/api/v1/users/${userId}`)
			.set('Authorization', `Bearer ${adminToken}`);

		expect(res.status).toBe(204);
	});

	it('non-admin cannot delete a user', async () => {
		// Create two regular users
		const signupRes1 = await request(app)
			.post('/api/v1/users/signup')
			.send(regularUser);
		const token = signupRes1.body.token;

		const signupRes2 = await request(app).post('/api/v1/users/signup').send({
			...regularUser,
			email: 'other@example.com',
		});
		const otherUserId = signupRes2.body.data.user._id;

		const res = await request(app)
			.delete(`/api/v1/users/${otherUserId}`)
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(403);
	});

	it('returns 401 when deleting without auth', async () => {
		const signupRes = await request(app)
			.post('/api/v1/users/signup')
			.send(regularUser);
		const userId = signupRes.body.data.user._id;

		const res = await request(app).delete(`/api/v1/users/${userId}`);

		expect(res.status).toBe(401);
	});

	it('returns 404 when deleting non-existent user', async () => {
		const adminToken = await getAdminToken();

		const res = await request(app)
			.delete('/api/v1/users/000000000000000000000000')
			.set('Authorization', `Bearer ${adminToken}`);

		expect(res.status).toBe(404);
	});
});
