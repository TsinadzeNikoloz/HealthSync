import { Page } from '@playwright/test';

export const MOCK_PATIENT = {
	_id: 'user-patient-1',
	id: 'user-patient-1',
	name: 'Test Patient',
	email: 'patient@test.com',
	role: 'USER' as const,
	photo: 'default.jpg',
};

export const MOCK_DOCTOR = {
	_id: 'user-doctor-1',
	id: 'user-doctor-1',
	name: 'Dr. Test Doctor',
	email: 'doctor@test.com',
	role: 'DOCTOR' as const,
	photo: 'default.jpg',
	specialty: 'Cardiology',
};

export const MOCK_ADMIN = {
	_id: 'user-admin-1',
	id: 'user-admin-1',
	name: 'Admin User',
	email: 'admin@test.com',
	role: 'ADMIN' as const,
	photo: 'default.jpg',
};

const EMPTY_LIST = { status: 'success', data: { docs: [] }, results: 0 };

/**
 * Sets up a mock authenticated session for a given user.
 * Must be called BEFORE page.goto().
 */
export async function mockAuth(page: Page, user = MOCK_PATIENT) {
	// Inject JWT into localStorage before any page scripts run
	await page.addInitScript(() => {
		localStorage.setItem('jwt', 'fake-test-token');
	});

	// Mock the /getMe endpoint to return the user
	await page.route('**/api/v1/users/getMe', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({ status: 'success', data: { doc: user } }),
		});
	});

	// Mock common list endpoints to avoid unhandled requests
	await page.route('**/api/v1/appointments/my-appointments**', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(EMPTY_LIST),
		});
	});

	await page.route('**/api/v1/appointments**', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(EMPTY_LIST),
		});
	});

	await page.route('**/api/v1/medical-records**', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(EMPTY_LIST),
		});
	});

	await page.route('**/api/v1/services**', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(EMPTY_LIST),
		});
	});

	await page.route('**/api/v1/users**', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(EMPTY_LIST),
		});
	});
}
