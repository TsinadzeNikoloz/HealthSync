import { test, expect } from '@playwright/test';

test.describe('Signup page', () => {
	test('renders signup form with required fields', async ({ page }) => {
		await page.goto('/signup');
		await expect(page.getByRole('heading', { name: 'Get Started' })).toBeVisible();
		await expect(page.getByPlaceholder('Enter your name')).toBeVisible();
		await expect(page.getByPlaceholder('name@email.com')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Create My Account' })).toBeVisible();
	});

	test('shows Sign Up tab as active on /signup', async ({ page }) => {
		await page.goto('/signup');
		const signupTab = page.getByRole('link', { name: 'Sign Up' });
		await expect(signupTab).toHaveClass(/text-blue-600/);
	});

	test('navigates to /login when Log In tab is clicked', async ({ page }) => {
		await page.goto('/signup');
		await page.getByRole('link', { name: 'Log In' }).click();
		await expect(page).toHaveURL('/login');
		await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
	});

	test('shows validation error when passwords do not match', async ({ page }) => {
		await page.goto('/signup');
		await page.getByPlaceholder('Enter your name').fill('Test User');
		await page.getByPlaceholder('name@email.com').fill('test@test.com');
		const passwordFields = page.getByPlaceholder('••••••••');
		await passwordFields.first().fill('Password1!');
		await passwordFields.last().fill('Different1!');
		await page.getByRole('button', { name: 'Create My Account' }).click();
		await expect(page.getByText('Passwords do not match')).toBeVisible();
	});

	test('optional details section expands on click', async ({ page }) => {
		await page.goto('/signup');
		await expect(page.getByPlaceholder('+36 00 000 00')).not.toBeVisible();
		await page.getByRole('button', { name: /Optional Details/i }).click();
		await expect(page.getByPlaceholder('+36 00 000 00')).toBeVisible();
	});
});
