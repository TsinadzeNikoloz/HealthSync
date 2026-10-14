import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/user.model.js';

const demoLogin = (role: string) =>
	request(app).post('/api/v1/users/demoLogin').send({ role });

describe('Demo accounts', () => {
	beforeEach(() => {
		process.env.DEMO_MODE = 'true';
	});
	afterEach(() => {
		delete process.env.DEMO_MODE;
	});

	it('reports whether demo mode is enabled', async () => {
		const on = await request(app).get('/api/v1/users/demoStatus');
		expect(on.body.data.enabled).toBe(true);

		process.env.DEMO_MODE = 'false';
		const off = await request(app).get('/api/v1/users/demoStatus');
		expect(off.body.data.enabled).toBe(false);
	});

	it('is disabled (404) unless DEMO_MODE=true', async () => {
		process.env.DEMO_MODE = 'false';
		const res = await demoLogin('USER');
		expect(res.status).toBe(404);
	});

	it('creates the account on first use and logs in as each role', async () => {
		for (const role of ['USER', 'DOCTOR', 'ADMIN']) {
			const res = await demoLogin(role);
			expect(res.status).toBe(200);
			expect(res.body.token).toBeDefined();
			expect(res.body.data.user.role).toBe(role);
			expect(res.body.data.user.isDemo).toBe(true);
		}

		// second login reuses the same account
		await demoLogin('USER');
		expect(await User.countDocuments({ isDemo: true })).toBe(3);
	});

	it('gives the demo doctor weekday availability', async () => {
		const res = await demoLogin('DOCTOR');
		expect(res.body.data.user.availability).toHaveLength(5);
	});

	it('rejects unknown roles and prototype keys', async () => {
		expect((await demoLogin('SUPERUSER')).status).toBe(400);
		expect((await demoLogin('constructor')).status).toBe(400);
		expect((await request(app).post('/api/v1/users/demoLogin').send({})).status).toBe(
			400,
		);
	});

	it('does not log into a real account that took a demo email', async () => {
		await request(app).post('/api/v1/users/signup').send({
			name: 'Real Person',
			email: 'demo.patient@example.com',
			password: 'Password123!',
			passwordConfirm: 'Password123!',
		});

		const res = await demoLogin('USER');
		expect(res.status).toBe(403);
	});

	it('blocks deleting users and changing passwords for the demo admin', async () => {
		const { body } = await demoLogin('ADMIN');
		const token = body.token as string;
		const auth = { Authorization: `Bearer ${token}` };

		const victim = await User.create({
			name: 'Some Victim',
			email: 'victim@example.com',
			password: 'Password123!',
			passwordConfirm: 'Password123!',
		});

		const del = await request(app)
			.delete(`/api/v1/users/${victim.id}`)
			.set(auth);
		expect(del.status).toBe(403);
		expect(await User.findById(victim.id)).not.toBeNull();

		const edit = await request(app)
			.patch(`/api/v1/users/${victim.id}`)
			.set(auth)
			.send({ role: 'ADMIN' });
		expect(edit.status).toBe(403);

		const create = await request(app)
			.post('/api/v1/users')
			.set(auth)
			.send({ name: 'New Admin', email: 'new@example.com' });
		expect(create.status).toBe(403);

		const pw = await request(app)
			.patch('/api/v1/users/updateMyPassword')
			.set(auth)
			.send({
				passwordCurrent: 'x',
				password: 'Password123!',
				passwordConfirm: 'Password123!',
			});
		expect(pw.status).toBe(403);

		const del2 = await request(app).delete('/api/v1/users/deleteMe').set(auth);
		expect(del2.status).toBe(403);
	});

	it('lets demo users edit their profile but not their email or 2FA', async () => {
		const { body } = await demoLogin('USER');
		const res = await request(app)
			.patch('/api/v1/users/updateMe')
			.set('Authorization', `Bearer ${body.token}`)
			.send({
				name: 'Demo Renamed',
				email: 'attacker@example.com',
				twoFactorEnabled: true,
			});

		expect(res.status).toBe(200);
		expect(res.body.data.user.name).toBe('Demo Renamed');
		expect(res.body.data.user.email).toBe('demo.patient@example.com');
		expect(res.body.data.user.twoFactorEnabled).toBe(false);
	});

	it('does not restrict normal accounts', async () => {
		const signup = await request(app).post('/api/v1/users/signup').send({
			name: 'Normal User',
			email: 'normal@example.com',
			password: 'Password123!',
			passwordConfirm: 'Password123!',
		});
		const res = await request(app)
			.delete('/api/v1/users/deleteMe')
			.set('Authorization', `Bearer ${signup.body.token}`);
		expect(res.status).toBe(204);
	});
});
