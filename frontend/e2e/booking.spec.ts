import { test, expect } from '@playwright/test';

const MOCK_PATIENT = {
	_id: 'user-patient-1',
	id: 'user-patient-1',
	name: 'Test Patient',
	email: 'patient@test.com',
	role: 'USER' as const,
	photo: 'default.jpg',
};

const MOCK_DOCTOR = {
	_id: 'doctor-1',
	name: 'Dr. Smith',
	email: 'dr.smith@healthsync.com',
};

const MOCK_SERVICE = {
	_id: 'service-1',
	id: 'service-1',
	name: 'Cardiology Consultation',
	slug: 'cardiology-consultation',
	summary: 'Expert heart health evaluation by our specialists.',
	description: 'Comprehensive cardiovascular assessment.',
	price: 150,
	duration: 60,
	category: 'CONSULTATION',
	imageCover: 'default.jpg',
	ratingsAverage: 4.8,
	ratingsQuantity: 24,
	doctors: [MOCK_DOCTOR],
};

// Tomorrow's date string (yyyy-mm-dd)
function getTomorrow(): string {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	return d.toISOString().slice(0, 10);
}

test.describe('Patient booking flow', () => {
	test('patient can log in, browse services, and book an appointment', async ({
		page,
	}) => {
		// NOTE: Playwright uses LIFO for route handlers.
		// General (broad) routes must be registered FIRST so that
		// specific routes registered later take priority.

		// --- General: notifications ---
		await page.route('**/api/v1/notifications**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ status: 'success', data: { docs: [] }, results: 0 }),
			});
		});

		// --- General: appointments list ---
		await page.route('**/api/v1/appointments**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ status: 'success', data: { docs: [] }, results: 0 }),
			});
		});

		// --- General: services list ---
		await page.route('**/api/v1/services*', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					status: 'success',
					data: { docs: [MOCK_SERVICE], count: 1 },
				}),
			});
		});

		// --- General: reviews ---
		await page.route('**/api/v1/reviews**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ status: 'success', data: { docs: [] }, results: 0 }),
			});
		});

		// --- Specific: login ---
		await page.route('**/api/v1/users/login', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					status: 'success',
					token: 'fake-jwt-token',
					data: { user: MOCK_PATIENT },
				}),
			});
		});

		// --- Specific: getMe ---
		await page.route('**/api/v1/users/getMe', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ status: 'success', data: { doc: MOCK_PATIENT } }),
			});
		});

		// --- Specific: available time slots ---
		await page.route('**/api/v1/users/availability/**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					status: 'success',
					data: { slots: ['09:00', '10:00', '11:00'] },
				}),
			});
		});

		// --- Specific: service detail (overrides list for /services/:slug URLs) ---
		await page.route('**/api/v1/services/**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ status: 'success', data: { doc: MOCK_SERVICE } }),
			});
		});

		// --- Specific: service reviews (overrides detail for /services/:id/reviews) ---
		await page.route('**/api/v1/services/*/reviews**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ status: 'success', data: { docs: [] }, results: 0 }),
			});
		});

		// --- Specific: create appointment after checkout ---
		await page.route(
			'**/api/v1/appointments/create-from-checkout',
			async (route) => {
				await route.fulfill({
					status: 201,
					contentType: 'application/json',
					body: JSON.stringify({
						status: 'success',
						data: { doc: { _id: 'appt-1' } },
					}),
				});
			},
		);

		// --- Specific: Stripe checkout session (overrides general appointments) ---
		// Returns a local checkout-success URL to simulate successful Stripe redirect
		await page.route(
			'**/api/v1/appointments/checkout-session/**',
			async (route) => {
				const tomorrow = getTomorrow();
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						status: 'success',
						session: {
							url: `http://localhost:3000/checkout-success?service=service-1&doctor=doctor-1&date=${tomorrow}T09%3A00%3A00&price=150`,
						},
					}),
				});
			},
		);

		// ----------------------------------------------------------------
		// Step 1: Navigate to login and submit credentials
		// ----------------------------------------------------------------
		await page.goto('/login');
		await expect(
			page.getByRole('heading', { name: 'Welcome Back' }),
		).toBeVisible();

		await page.getByPlaceholder('name@email.com').fill('patient@test.com');
		await page.getByPlaceholder('••••••••').fill('password123');
		await page.getByRole('button', { name: 'Sign In to Account' }).click();

		// ----------------------------------------------------------------
		// Step 2: Should redirect to dashboard
		// ----------------------------------------------------------------
		await expect(page).toHaveURL('/dashboard');

		// ----------------------------------------------------------------
		// Step 3: Navigate to services and verify the service card
		// ----------------------------------------------------------------
		await page.goto('/services');
		await expect(page.getByText('Cardiology Consultation')).toBeVisible();

		// ----------------------------------------------------------------
		// Step 4: Click "Book Session" on the service card -> goes to detail
		// ----------------------------------------------------------------
		await page
			.getByRole('button', { name: /Book Session/i })
			.first()
			.click();
		await expect(page).toHaveURL('/services/cardiology-consultation');

		// ----------------------------------------------------------------
		// Step 5: Click "Book Session" button on the detail page (opens modal)
		// ----------------------------------------------------------------
		await expect(
			page.getByRole('button', { name: 'Book Session' }),
		).toBeVisible();
		await page.getByRole('button', { name: 'Book Session' }).click();

		// ----------------------------------------------------------------
		// Step 6: In modal - select doctor
		// ----------------------------------------------------------------
		await page.getByLabel('Assigned Physician').selectOption('doctor-1');

		// ----------------------------------------------------------------
		// Step 7: Select tomorrow's date
		// ----------------------------------------------------------------
		await page.getByLabel('Date').fill(getTomorrow());

		// ----------------------------------------------------------------
		// Step 8: Wait for time slots and pick 09:00
		// ----------------------------------------------------------------
		await expect(page.getByRole('button', { name: '09:00' })).toBeVisible();
		await page.getByRole('button', { name: '09:00' }).click();

		// ----------------------------------------------------------------
		// Step 9: Confirm reservation (triggers Stripe checkout)
		// ----------------------------------------------------------------
		await page.getByRole('button', { name: 'Confirm Reservation' }).click();

		// ----------------------------------------------------------------
		// Step 10: Should land on checkout-success with booking confirmed
		// ----------------------------------------------------------------
		await expect(page).toHaveURL(/checkout-success/, { timeout: 10000 });
		await expect(page.getByText('Booking Confirmed!')).toBeVisible({
			timeout: 10000,
		});
	});
});
