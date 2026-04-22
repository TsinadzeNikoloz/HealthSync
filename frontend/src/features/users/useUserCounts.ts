import { useQuery } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import { Role, type User } from '../../types';

async function getAllUsers(): Promise<User[]> {
	const { data } = await apiClient.get('/users', { params: { limit: '1000' } });
	return data.data.docs as User[];
}

export function useUserCounts() {
	const { data: users = [] } = useQuery({
		queryKey: ['users-all'],
		queryFn: getAllUsers,
	});

	return {
		patients: users.filter((u) => u.role === Role.PATIENT).length,
		doctors: users.filter((u) => u.role === Role.DOCTOR).length,
		admins: users.filter((u) => u.role === Role.ADMIN).length,
		total: users.length,
	};
}
