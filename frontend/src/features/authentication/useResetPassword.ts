import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword as resetPasswordApi } from '../../services/apiAuth';

interface ResetPasswordData {
	token: string;
	password: string;
	passwordConfirm: string;
}

export function useResetPassword() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { mutate: resetPassword, isPending } = useMutation({
		mutationFn: ({ token, password, passwordConfirm }: ResetPasswordData) =>
			resetPasswordApi(token, password, passwordConfirm),
		onSuccess: (data) => {
			queryClient.setQueryData(['user'], data.data.user);
			toast.success('Password reset! Welcome back.');
			navigate('/dashboard', { replace: true });
		},
		onError: (err: Error) => {
			toast.error(
				err.message || 'Failed to reset password. The link may have expired.',
			);
		},
	});

	return { resetPassword, isPending };
}
