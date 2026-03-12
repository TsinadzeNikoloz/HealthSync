import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_URL } from '../../utils/constants';
import { getAuthHeaders } from '../../utils/helpers';

async function deleteMyAccount(): Promise<void> {
	const res = await fetch(`${API_URL}/users/deleteMe`, {
		method: 'DELETE',
		headers: getAuthHeaders(),
		credentials: 'include',
	});

	if (!res.ok && res.status !== 204) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data?.message || 'Failed to delete account');
	}
}

export function useDeleteAccount() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { mutate: deleteAccount, isPending } = useMutation({
		mutationFn: deleteMyAccount,
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
