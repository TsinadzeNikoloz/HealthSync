import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login as loginApi } from '../../services/apiAuth';
import type { LoginFormData } from '../../types';

export function useLogin() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [pendingEmail, setPendingEmail] = useState<string | null>(null);

	const { mutate: login, isPending } = useMutation({
		mutationFn: (credentials: LoginFormData) => loginApi(credentials),
		onSuccess: (data, variables) => {
			if (data.status === 'pending') {
				setPendingEmail(variables.email);
				toast.success('Verification code sent to your email');
				return;
			}
			queryClient.setQueryData(['user'], data.user);
			navigate('/dashboard', { replace: true });
		},
		onError: () => {
			toast.error('Provided email or password are incorrect');
		},
	});

	return { login, isPending, pendingEmail, setPendingEmail };
}
