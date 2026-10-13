import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

const user = {
	name: 'Upload User',
	email: 'upload@example.com',
	password: 'Password123!',
	passwordConfirm: 'Password123!',
};

describe('Image upload size limit', () => {
	it('rejects photos larger than 5 MB with a clear 400', async () => {
		const signup = await request(app).post('/api/v1/users/signup').send(user);
		const token = signup.body.token as string;

		const res = await request(app)
			.patch('/api/v1/users/updateMe')
			.set('Authorization', `Bearer ${token}`)
			.attach('photo', Buffer.alloc(6 * 1024 * 1024), {
				filename: 'big.jpg',
				contentType: 'image/jpeg',
			});

		expect(res.status).toBe(400);
		expect(res.body.message).toMatch(/5 MB/);
	});
});
