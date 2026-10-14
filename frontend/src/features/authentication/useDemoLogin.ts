import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
	demoLogin as demoLoginApi,
	getDemoStatus,
	type DemoRole,
} from '../../services/apiAuth';

export function useDemoLogin() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { data: enabled = false } = useQuery({
		queryKey: ['demoStatus'],
		queryFn: getDemoStatus,
		staleTime: Infinity,
		retry: false,
	});

	const { mutate: demoLogin, isPending } = useMutation({
		mutationFn: (role: DemoRole) => demoLoginApi(role),
		onSuccess: ({ user }) => {
			queryClient.setQueryData(['user'], user);
			toast.success(`Signed in as ${user.name}`);
			navigate('/dashboard', { replace: true });
		},
		onError: (err: Error) => {
			toast.error(err.message || 'Demo login is unavailable right now');
		},
	});

	return { enabled, demoLogin, isPending };
}
