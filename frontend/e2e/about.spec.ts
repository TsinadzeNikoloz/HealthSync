import { test, expect } from '@playwright/test';

test.describe('About Us page', () => {
	test('renders page heading', async ({ page }) => {
		await page.goto('/about');
		await expect(page.getByRole('heading', { name: 'We Care About Your Health' })).toBeVisible();
	});

	test('renders Our Mission section', async ({ page }) => {
		await page.goto('/about');
		await expect(page.getByRole('heading', { name: 'Our Mission' })).toBeVisible();
	});

	test('renders Why Choose HealthSync cards', async ({ page }) => {
		await page.goto('/about');
		await expect(page.getByText('Expert Physicians')).toBeVisible();
		await expect(page.getByText('Modern Technology')).toBeVisible();
		await expect(page.getByText('Patient First')).toBeVisible();
	});

	test('contact button opens modal', async ({ page }) => {
		await page.goto('/about');
		await page.getByRole('button', { name: /Send a Message/i }).click();
		await expect(page.getByRole('heading', { name: 'Contact Support' })).toBeVisible();
	});

	test('contact modal shows form fields', async ({ page }) => {
		await page.goto('/about');
		await page.getByRole('button', { name: /Send a Message/i }).click();
		await expect(page.getByPlaceholder('John Doe')).toBeVisible();
		await expect(page.getByPlaceholder('you@email.com')).toBeVisible();
		await expect(page.getByPlaceholder('How can we help?')).toBeVisible();
		await expect(page.getByPlaceholder('Describe your issue or question...')).toBeVisible();
	});

	test('contact modal closes when dismissed', async ({ page }) => {
		await page.goto('/about');
		await page.getByRole('button', { name: /Send a Message/i }).click();
		await expect(page.getByRole('heading', { name: 'Contact Support' })).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('heading', { name: 'Contact Support' })).not.toBeVisible();
	});
});
