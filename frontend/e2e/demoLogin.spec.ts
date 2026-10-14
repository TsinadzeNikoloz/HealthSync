import { test, expect } from '@playwright/test';

const mockStatus = (page: import('@playwright/test').Page, enabled: boolean) =>
	page.route('**/api/v1/users/demoStatus', (route) =>
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({ status: 'success', data: { enabled } }),
		}),
	);

test.describe('Demo login', () => {
	test('shows the three demo buttons when demo mode is enabled', async ({ page }) => {
		await mockStatus(page, true);
		await page.goto('/login');

		await expect(page.getByText('Or try a demo account')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Patient' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Doctor' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Admin' })).toBeVisible();
	});

	test('hides the demo buttons when demo mode is disabled', async ({ page }) => {
		await mockStatus(page, false);
		await page.goto('/login');

		await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
		await expect(page.getByText('Or try a demo account')).toHaveCount(0);
	});

	test('clicking a demo button requests that role', async ({ page }) => {
		await mockStatus(page, true);
		let requestedRole: string | undefined;
		await page.route('**/api/v1/users/demoLogin', async (route) => {
			requestedRole = route.request().postDataJSON().role;
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					status: 'success',
					token: 'fake-token',
					data: {
						user: {
							_id: '1',
							id: '1',
							name: 'Demo Doctor',
							email: 'demo.doctor@example.com',
							role: 'DOCTOR',
							isDemo: true,
						},
					},
				}),
			});
		});

		await page.goto('/login');
		await page.getByRole('button', { name: 'Doctor' }).click();

		await expect.poll(() => requestedRole).toBe('DOCTOR');
	});
});
