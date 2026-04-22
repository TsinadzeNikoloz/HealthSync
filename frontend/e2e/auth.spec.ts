import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
	test('renders login form with all elements', async ({ page }) => {
		await page.goto('/login');
		await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
		await expect(page.getByPlaceholder('name@email.com')).toBeVisible();
		await expect(page.getByPlaceholder('••••••••')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign In to Account' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Forgot?' })).toBeVisible();
	});

	test('shows Log In tab as active on /login', async ({ page }) => {
		await page.goto('/login');
		const loginTab = page.getByRole('link', { name: 'Log In' });
		await expect(loginTab).toHaveClass(/text-blue-600/);
	});

	test('navigates to /signup when Sign Up tab is clicked', async ({ page }) => {
		await page.goto('/login');
		await page.getByRole('link', { name: 'Sign Up' }).click();
		await expect(page).toHaveURL('/signup');
		await expect(page.getByRole('heading', { name: 'Get Started' })).toBeVisible();
	});

test('shows error on invalid credentials', async ({ page }) => {
		await page.route('**/api/v1/users/login', async (route) => {
			await route.fulfill({
				status: 401,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'Incorrect email or password' }),
			});
		});

		await page.goto('/login');
		await page.getByPlaceholder('name@email.com').fill('wrong@email.com');
		await page.getByPlaceholder('••••••••').fill('wrongpassword');
		await page.getByRole('button', { name: 'Sign In to Account' }).click();
		await expect(page.getByText('Incorrect email or password')).toBeVisible();
	});

	test('has working links to Browse Services and About Us', async ({ page }) => {
		await page.goto('/login');
		await expect(page.getByRole('link', { name: /Browse Services/i })).toHaveAttribute('href', '/services');
		await expect(page.getByRole('link', { name: /About Us/i })).toHaveAttribute('href', '/about');
	});
});
