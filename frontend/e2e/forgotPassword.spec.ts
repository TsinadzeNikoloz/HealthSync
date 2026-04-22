import { test, expect } from '@playwright/test';

test.describe('Forgot Password page', () => {
	test('renders form with email input and submit button', async ({ page }) => {
		await page.goto('/forgot-password');
		await expect(page.getByRole('heading', { name: 'Forgot Password' })).toBeVisible();
		await expect(page.getByPlaceholder('name@email.com')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Send Reset Link' })).toBeVisible();
	});

	test('has a back to login link', async ({ page }) => {
		await page.goto('/forgot-password');
		await expect(page.getByRole('link', { name: /Back to login/i })).toBeVisible();
	});

	test('navigates back to /login when back link is clicked', async ({ page }) => {
		await page.goto('/forgot-password');
		await page.getByRole('link', { name: /Back to login/i }).click();
		await expect(page).toHaveURL('/login');
	});

	test('shows success state after submitting', async ({ page }) => {
		await page.route('**/api/v1/users/forgotPassword', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ status: 'success', message: 'Token sent to email' }),
			});
		});

		await page.goto('/forgot-password');
		await page.getByPlaceholder('name@email.com').fill('test@example.com');
		await page.getByRole('button', { name: 'Send Reset Link' }).click();
		await expect(page.getByRole('heading', { name: 'Check Your Inbox' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Back to Login' })).toBeVisible();
	});
});
