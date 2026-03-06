import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signup as signupApi } from '../../services/apiAuth';
import type { SignupFormData } from '../../types';

export function useSignup() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { mutate: signup, isPending } = useMutation({
		mutationFn: (formData: SignupFormData) => signupApi(formData),
		onSuccess: (data) => {
			queryClient.setQueryData(['user'], data.user);
			toast.success('Account successfully created!');
			navigate('/dashboard', { replace: true });
		},
		onError: (err: Error) => {
			toast.error(err.message || 'Failed to create account');
		},
	});

	return { signup, isPending };
}
