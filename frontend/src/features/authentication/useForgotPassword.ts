import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { forgotPassword as forgotPasswordApi } from '../../services/apiAuth';

export function useForgotPassword() {
	const { mutate: forgotPassword, isPending } = useMutation({
		mutationFn: (email: string) => forgotPasswordApi(email),
		onSuccess: () => {
			toast.success('If that email is registered, a reset link has been sent.');
		},
		onError: (err: Error) => {
			toast.error(err.message || 'Failed to send reset link. Please try again.');
		},
	});

	return { forgotPassword, isPending };
}
