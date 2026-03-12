import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../../utils/constants';
import { getAuthHeaders } from '../../utils/helpers';
import { Role, type User } from '../../types';

async function getAllUsers(): Promise<User[]> {
	const res = await fetch(`${API_URL}/users?limit=1000`, {
		method: 'GET',
		credentials: 'include',
		headers: getAuthHeaders(),
	});
	const data = await res.json();
	if (data.status !== 'success') throw new Error(data.message);
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
