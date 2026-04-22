import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
	test('redirects unauthenticated user to /login from protected route', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page).toHaveURL('/login');
	});

	test('services page is accessible without login', async ({ page }) => {
		await page.route('**/api/v1/services*', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ status: 'success', data: { docs: [], count: 0 } }),
			});
		});

		await page.goto('/services');
		await expect(page).toHaveURL('/services');
	});

	test('about page is accessible without login', async ({ page }) => {
		await page.goto('/about');
		await expect(page).toHaveURL('/about');
	});

	test('forgot password page is accessible', async ({ page }) => {
		await page.goto('/forgot-password');
		await expect(page).toHaveURL('/forgot-password');
	});

	test('/login shows correct page title', async ({ page }) => {
		await page.goto('/login');
		await expect(page).toHaveTitle(/Login/);
	});

	test('/signup shows correct page title', async ({ page }) => {
		await page.goto('/signup');
		await expect(page).toHaveTitle(/Sign Up/);
	});
});
