import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createUser } from '../../services/apiUsers';
import type { CreateUserFormData } from '../../types';

export function useCreateUser() {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: (data: CreateUserFormData) => createUser(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			queryClient.invalidateQueries({ queryKey: ['users-all'] });
			toast.success('User created successfully');
		},
		onError: (err: Error) => toast.error(err.message),
	});

	return { createUser: mutate, isCreating: isPending };
}
