import apiClient from './apiClient';
import { buildQueryParams } from './buildQueryParams';
import type { User, CreateUserFormData, FilterParam, SortParam } from '../types';

// ---------------------------------------------------------------------------
// GET ALL USERS (with filter, sort, pagination)
// ---------------------------------------------------------------------------
export async function getUsers({
	filter,
	sortBy,
	page,
	search,
}: {
	filter?: FilterParam | null;
	sortBy?: SortParam | null;
	page?: number;
	search?: string;
}): Promise<{ data: User[]; count: number }> {
	const params = buildQueryParams({ filter, sortBy, page, search });

	const { data } = await apiClient.get('/users', { params });
	return { data: data.data.docs as User[], count: data.results };
}

// ---------------------------------------------------------------------------
// GET ALL DOCTORS (public)
// ---------------------------------------------------------------------------
export async function getDoctors({
	filter,
	sortBy,
	page,
	search,
}: {
	filter?: FilterParam | null;
	sortBy?: SortParam | null;
	page?: number;
	search?: string;
}): Promise<{ data: User[]; count: number }> {
	const params = buildQueryParams({ filter, sortBy, page, search });

	const { data } = await apiClient.get('/users/doctors', { params });
	return { data: data.data.docs as User[], count: data.results };
}

// ---------------------------------------------------------------------------
// GET USER COUNTS (admin dashboard)
// ---------------------------------------------------------------------------
export async function getUserCounts(): Promise<{ patients: number; doctors: number }> {
	const { data } = await apiClient.get('/users/counts');
	return data.data as { patients: number; doctors: number };
}

// ---------------------------------------------------------------------------
// GET SINGLE USER
// ---------------------------------------------------------------------------
export async function getUser(id: string): Promise<User> {
	const { data } = await apiClient.get(`/users/${id}`);
	return data.data.doc as User;
}

// ---------------------------------------------------------------------------
// CREATE USER (admin only)
// ---------------------------------------------------------------------------
export async function createUser(
	userData: CreateUserFormData,
): Promise<User> {
	const { data } = await apiClient.post('/users', userData);
	return data.data.doc as User;
}

// ---------------------------------------------------------------------------
// UPDATE USER (admin only)
// ---------------------------------------------------------------------------
export async function updateUser({
	id,
	updates,
}: {
	id: string;
	updates: Partial<User>;
}): Promise<User> {
	const { data } = await apiClient.patch(`/users/${id}`, updates);
	return data.data.doc as User;
}

// ---------------------------------------------------------------------------
// DELETE USER (admin only)
// ---------------------------------------------------------------------------
export async function deleteUser(id: string): Promise<void> {
	await apiClient.delete(`/users/${id}`);
}
