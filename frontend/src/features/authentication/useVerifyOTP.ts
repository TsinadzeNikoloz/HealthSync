import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { verifyOTP as verifyOTPApi } from '../../services/apiAuth';

export function useVerifyOTP() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { mutate: verifyOTP, isPending } = useMutation({
		mutationFn: (data: { email: string; otp: string }) => verifyOTPApi(data),
		onSuccess: (data) => {
			queryClient.setQueryData(['user'], data.user);
			navigate('/dashboard', { replace: true });
		},
		onError: () => {
			toast.error('Invalid or expired verification code');
		},
	});

	return { verifyOTP, isPending };
}
