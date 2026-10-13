import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword as resetPasswordApi } from '../../services/apiAuth';

interface ResetPasswordData {
	email: string;
	code: string;
	password: string;
	passwordConfirm: string;
}

export function useResetPassword() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { mutate: resetPassword, isPending } = useMutation({
		mutationFn: ({ email, code, password, passwordConfirm }: ResetPasswordData) =>
			resetPasswordApi(email, code, password, passwordConfirm),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user'] });
			toast.success('Password reset! Welcome back.');
			navigate('/dashboard', { replace: true });
		},
		onError: (err: Error) => {
			toast.error(
				err.message || 'Failed to reset password. The code may have expired.',
			);
		},
	});

	return { resetPassword, isPending };
}
