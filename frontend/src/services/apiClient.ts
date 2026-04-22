import axios from 'axios';
import { API_URL } from '../utils/constants';

const apiClient = axios.create({
	baseURL: API_URL,
	withCredentials: true,
});

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
	const token = localStorage.getItem('jwt');
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

// Extract readable error message, redirect to login on expired/invalid token
apiClient.interceptors.response.use(
	(res) => res,
	(error) => {
		const isAuthRequest =
			error.config?.url?.includes('/users/login') ||
			error.config?.url?.includes('/users/verifyOTP');
		if (error.response?.status === 401 && !isAuthRequest) {
			localStorage.removeItem('jwt');
			window.location.href = '/login';
		}
		const message =
			error.response?.data?.message ?? error.message ?? 'Something went wrong';
		throw new Error(message);
	},
);

export default apiClient;
