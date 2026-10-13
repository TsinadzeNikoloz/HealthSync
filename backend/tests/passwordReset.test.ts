import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

let lastCode = '';

vi.mock('../utils/email.js', () => ({
	default: class {
		async sendWelcome() {}
		async sendPasswordReset(code: string) {
			lastCode = code;
		}
	},
}));

import app from '../app.js';

const user = {
	name: 'Reset User',
	email: 'reset@example.com',
	password: 'Password123!',
	passwordConfirm: 'Password123!',
};

const newPassword = {
	password: 'NewPassword456!',
	passwordConfirm: 'NewPassword456!',
};

describe('Auth - Password reset with emailed code', () => {
	beforeEach(async () => {
		lastCode = '';
		await request(app).post('/api/v1/users/signup').send(user);
	});

	it('emails a 6-digit code and resets the password with it', async () => {
		const forgot = await request(app)
			.post('/api/v1/users/forgotPassword')
			.send({ email: user.email });
		expect(forgot.status).toBe(200);
		expect(lastCode).toMatch(/^\d{6}$/);

		const reset = await request(app)
			.patch('/api/v1/users/resetPassword')
			.send({ email: user.email, code: lastCode, ...newPassword });
		expect(reset.status).toBe(200);
		expect(reset.body.token).toBeDefined();

		const login = await request(app)
			.post('/api/v1/users/login')
			.send({ email: user.email, password: newPassword.password });
		expect(login.status).toBe(200);
	});

	it('rejects a wrong code', async () => {
		await request(app)
			.post('/api/v1/users/forgotPassword')
			.send({ email: user.email });

		const wrong = lastCode === '000000' ? '111111' : '000000';
		const res = await request(app)
			.patch('/api/v1/users/resetPassword')
			.send({ email: user.email, code: wrong, ...newPassword });
		expect(res.status).toBe(400);
	});

	it('cannot reuse a code after a successful reset', async () => {
		await request(app)
			.post('/api/v1/users/forgotPassword')
			.send({ email: user.email });
		const code = lastCode;

		await request(app)
			.patch('/api/v1/users/resetPassword')
			.send({ email: user.email, code, ...newPassword });

		const again = await request(app)
			.patch('/api/v1/users/resetPassword')
			.send({ email: user.email, code, ...newPassword });
		expect(again.status).toBe(400);
	});

	it('locks the code after too many wrong attempts', async () => {
		await request(app)
			.post('/api/v1/users/forgotPassword')
			.send({ email: user.email });
		const correct = lastCode;
		const wrong = correct === '000000' ? '111111' : '000000';

		for (let i = 0; i < 5; i++) {
			await request(app)
				.patch('/api/v1/users/resetPassword')
				.send({ email: user.email, code: wrong, ...newPassword });
		}

		// Even the correct code no longer works
		const res = await request(app)
			.patch('/api/v1/users/resetPassword')
			.send({ email: user.email, code: correct, ...newPassword });
		expect(res.status).toBe(400);
	});

	it('does not accept a code for a different email', async () => {
		await request(app)
			.post('/api/v1/users/forgotPassword')
			.send({ email: user.email });

		const res = await request(app)
			.patch('/api/v1/users/resetPassword')
			.send({ email: 'someone-else@example.com', code: lastCode, ...newPassword });
		expect(res.status).toBe(400);
	});

	it('rejects non-string email/code (NoSQL injection attempt)', async () => {
		const res = await request(app)
			.patch('/api/v1/users/resetPassword')
			.send({ email: { $ne: null }, code: { $ne: null }, ...newPassword });
		expect(res.status).toBe(400);
	});
});
