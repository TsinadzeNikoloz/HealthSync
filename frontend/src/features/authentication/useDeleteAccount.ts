import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { deleteMe } from '../../services/apiAuth';

export function useDeleteAccount() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { mutate: deleteAccount, isPending } = useMutation({
		mutationFn: deleteMe,
		onSuccess: () => {
			queryClient.removeQueries();
			navigate('/login', { replace: true });
			toast.success('Account deleted successfully.');
		},
		onError: (err: Error) => {
			toast.error(err.message || 'Failed to delete account. Please try again.');
		},
	});

	return { deleteAccount, isPending };
}
