import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { getServices } from '../../services/apiServices';
import { SERVICES_PAGE_SIZE } from '../../utils/constants';

export function useServices() {
	const queryClient = useQueryClient();
	const [searchParams] = useSearchParams();

	// FILTER
	const filterValue = searchParams.get('category');
	const filter =
		!filterValue || filterValue === 'all'
			? null
			: { field: 'category', value: filterValue };

	// SORT
	const sortByRaw = searchParams.get('sortBy') || 'name-asc';
	const [field, direction] = sortByRaw.split('-') as [string, 'asc' | 'desc'];
	const sortBy = { field, direction };

	// PAGINATION
	const page = !searchParams.get('page') ? 1 : Number(searchParams.get('page'));

	const search = searchParams.get('search') || '';

	// QUERY
	const {
		data: { data: services, count } = { data: [], count: 0 },
		isPending,
		error,
	} = useQuery({
		queryKey: ['services', filter, sortBy, page, search],
		queryFn: () => getServices({ filter, sortBy, page, search }),
	});

	// PRE-FETCHING
	const pageCount = Math.ceil(count / SERVICES_PAGE_SIZE);

	if (page < pageCount)
		queryClient.prefetchQuery({
			queryKey: ['services', filter, sortBy, page + 1, search],
			queryFn: () => getServices({ filter, sortBy, page: page + 1, search }),
		});

	if (page > 1)
		queryClient.prefetchQuery({
			queryKey: ['services', filter, sortBy, page - 1, search],
			queryFn: () => getServices({ filter, sortBy, page: page - 1, search }),
		});

	return { services, count, isPending, error };
}
