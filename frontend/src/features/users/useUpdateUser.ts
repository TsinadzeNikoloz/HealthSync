import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { updateUser } from '../../services/apiUsers';
import type { User } from '../../types';

export function useUpdateUser() {
	const queryClient = useQueryClient();

	const { mutate: updateUserField, isPending: isUpdating } = useMutation({
		mutationFn: ({ id, updates }: { id: string; updates: Partial<User> }) =>
			updateUser({ id, updates }),
		onSuccess: () => {
			toast.success('User successfully updated');
			queryClient.invalidateQueries({ queryKey: ['users'] });
		},
		onError: (err: Error) => {
			toast.error(err.message || 'Failed to update user');
		},
	});

	return { updateUserField, isUpdating };
}
