import { PAGE_SIZE } from '../utils/constants';
import type { FilterParam, SortParam } from '../types';

export interface QueryOptions {
	filter?: FilterParam | null;
	sortBy?: SortParam | null;
	page?: number;
	search?: string;
	pageSize?: number;
}

export function buildQueryParams({
	filter,
	sortBy,
	page,
	search,
	pageSize = PAGE_SIZE,
}: QueryOptions): Record<string, string> {
	const params: Record<string, string> = {};

	if (search) params.search = search;
	if (filter) params[filter.field] = filter.value;
	if (sortBy)
		params.sort = `${sortBy.direction === 'desc' ? '-' : ''}${sortBy.field}`;
	if (page) {
		params.page = String(page);
		params.limit = String(pageSize);
	}

	return params;
}
