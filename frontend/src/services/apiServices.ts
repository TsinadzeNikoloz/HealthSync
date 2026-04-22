import { SERVICES_PAGE_SIZE } from '../utils/constants';
import apiClient from './apiClient';
import { buildQueryParams } from './buildQueryParams';
import type {
	Service,
	ServiceStat,
	FilterParam,
	SortParam,
} from '../types';

// ---------------------------------------------------------------------------
// GET ALL SERVICES (with filter, sort, pagination)
// ---------------------------------------------------------------------------
export async function getServices({
	filter,
	sortBy,
	page,
	search,
}: {
	filter?: FilterParam | null;
	sortBy?: SortParam | null;
	page?: number;
	search?: string;
}): Promise<{ data: Service[]; count: number }> {
	const params = buildQueryParams({ filter, sortBy, page, search, pageSize: SERVICES_PAGE_SIZE });

	const { data } = await apiClient.get('/services', { params });
	return { data: data.data.docs as Service[], count: data.results };
}

// ---------------------------------------------------------------------------
// GET SINGLE SERVICE
// ---------------------------------------------------------------------------
export async function getService(id: string): Promise<Service> {
	const { data } = await apiClient.get(`/services/${id}`);
	return data.data.doc as Service;
}

// ---------------------------------------------------------------------------
// GET TOP 5 SERVICES (top-rated, cheapest)
// ---------------------------------------------------------------------------
export async function getTopServices(): Promise<Service[]> {
	const { data } = await apiClient.get('/services/top-5-cheap');
	return data.data.docs as Service[];
}

// ---------------------------------------------------------------------------
// GET SERVICE STATS
// ---------------------------------------------------------------------------
export async function getServiceStats(): Promise<ServiceStat[]> {
	const { data } = await apiClient.get('/services/service-stats');
	return data.data.stats as ServiceStat[];
}

// ---------------------------------------------------------------------------
// CREATE SERVICE
// ---------------------------------------------------------------------------
export async function createService(formData: FormData): Promise<Service> {
	const { data } = await apiClient.post('/services', formData);
	return data.data.doc as Service;
}

// ---------------------------------------------------------------------------
// UPDATE SERVICE
// ---------------------------------------------------------------------------
export async function updateService({
	id,
	formData,
}: {
	id: string;
	formData: FormData;
}): Promise<Service> {
	const { data } = await apiClient.patch(`/services/${id}`, formData);
	return data.data.doc as Service;
}

// ---------------------------------------------------------------------------
// DELETE SERVICE
// ---------------------------------------------------------------------------
export async function deleteService(id: string): Promise<void> {
	await apiClient.delete(`/services/${id}`);
}
