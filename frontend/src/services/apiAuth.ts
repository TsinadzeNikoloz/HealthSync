import apiClient from './apiClient';
import type {
	User,
	LoginFormData,
	SignupFormData,
	UpdatePasswordFormData,
	AvailabilitySlot,
} from '../types';

// ---------------------------------------------------------------------------
// LOGIN
// ---------------------------------------------------------------------------
export async function login({
	email,
	password,
}: LoginFormData): Promise<
	{ status: 'success'; user: User; token: string } | { status: 'pending' }
> {
	const { data } = await apiClient.post('/users/login', { email, password });

	if (data.status === 'pending') return { status: 'pending' };

	localStorage.setItem('jwt', data.token);
	return { status: 'success', user: data.data.user, token: data.token };
}

// ---------------------------------------------------------------------------
// VERIFY OTP (Two-Factor Authentication)
// ---------------------------------------------------------------------------
export async function verifyOTP({
	email,
	otp,
}: {
	email: string;
	otp: string;
}): Promise<{ user: User; token: string }> {
	const { data } = await apiClient.post('/users/verifyOTP', { email, otp });
	localStorage.setItem('jwt', data.token);
	return { user: data.data.user, token: data.token };
}

// ---------------------------------------------------------------------------
// SIGNUP
// ---------------------------------------------------------------------------
export async function signup(
	formData: SignupFormData,
): Promise<{ user: User; token: string }> {
	const { data } = await apiClient.post('/users/signup', formData);
	localStorage.setItem('jwt', data.token);
	return { user: data.data.user, token: data.token };
}

// ---------------------------------------------------------------------------
// LOGOUT
// ---------------------------------------------------------------------------
export async function logout(): Promise<void> {
	await apiClient.get('/users/logout');
	localStorage.removeItem('jwt');
}

// ---------------------------------------------------------------------------
// GET CURRENT USER
// ---------------------------------------------------------------------------
export async function getCurrentUser(): Promise<User | null> {
	const token = localStorage.getItem('jwt');
	if (!token) return null;

	try {
		const { data } = await apiClient.get('/users/getMe');
		return data.data.doc as User;
	} catch {
		return null;
	}
}

// ---------------------------------------------------------------------------
// UPDATE ME (profile - supports file upload via FormData)
// ---------------------------------------------------------------------------
export async function updateMe(formData: FormData): Promise<User> {
	const { data } = await apiClient.patch('/users/updateMe', formData);
	return data.data.user as User;
}

// ---------------------------------------------------------------------------
// DELETE ME
// ---------------------------------------------------------------------------
export async function deleteMe(): Promise<void> {
	await apiClient.delete('/users/deleteMe');
	localStorage.removeItem('jwt');
}

// ---------------------------------------------------------------------------
// UPDATE PASSWORD
// ---------------------------------------------------------------------------
export async function updatePassword(
	passwords: UpdatePasswordFormData,
): Promise<void> {
	const { data } = await apiClient.patch('/users/updateMyPassword', passwords);
	localStorage.setItem('jwt', data.token);
}

// ---------------------------------------------------------------------------
// UPDATE AVAILABILITY (doctors only)
// ---------------------------------------------------------------------------
export async function updateAvailability(
	availability: AvailabilitySlot[],
): Promise<User> {
	const { data } = await apiClient.patch('/users/updateMe', { availability });
	return data.data.user as User;
}

// ---------------------------------------------------------------------------
// FORGOT PASSWORD
// ---------------------------------------------------------------------------
export async function forgotPassword(email: string): Promise<void> {
	await apiClient.post('/users/forgotPassword', { email });
}

// ---------------------------------------------------------------------------
// RESET PASSWORD
// ---------------------------------------------------------------------------
export async function resetPassword(
	token: string,
	password: string,
	passwordConfirm: string,
): Promise<void> {
	const { data } = await apiClient.patch(`/users/resetPassword/${token}`, {
		password,
		passwordConfirm,
	});
	localStorage.setItem('jwt', data.token);
}
