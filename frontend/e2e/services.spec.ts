import { test, expect } from '@playwright/test';

test.describe('Services page', () => {
	test('renders search input', async ({ page }) => {
		await page.route('**/api/v1/services*', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ status: 'success', data: { docs: [], count: 0 } }),
			});
		});

		await page.goto('/services');
		await expect(page.getByPlaceholder('Search services...')).toBeVisible();
	});

	test('shows empty state when no services', async ({ page }) => {
		await page.route('**/api/v1/services*', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ status: 'success', data: { docs: [], count: 0 } }),
			});
		});

		await page.goto('/services');
		await expect(page.getByText('No services available yet')).toBeVisible();
	});

	test('shows no-results state when search returns empty', async ({ page }) => {
		await page.route('**/api/v1/services*', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ status: 'success', data: { docs: [], count: 0 } }),
			});
		});

		await page.goto('/services?search=xyznotfound');
		await expect(page.getByText(/No results for/)).toBeVisible();
	});

	test('renders service cards when services exist', async ({ page }) => {
		await page.route('**/api/v1/services*', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					status: 'success',
					data: {
						docs: [
							{
								_id: '1',
								id: '1',
								name: 'Cardiology',
								summary: 'Heart care',
								price: 100,
								duration: 60,
								category: 'Cardiology',
								slug: 'cardiology',
								doctors: [],
							},
						],
						count: 1,
					},
				}),
			});
		});

		await page.goto('/services');
		await expect(page.getByRole('heading', { name: 'Cardiology' })).toBeVisible();
	});
});
