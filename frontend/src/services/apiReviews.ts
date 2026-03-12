import { API_URL, PAGE_SIZE } from '../utils/constants';
import { getAuthHeaders } from '../utils/helpers';
import type {
	Review,
	CreateReviewFormData,
	FilterParam,
	SortParam,
} from '../types';

// ---------------------------------------------------------------------------
// GET REVIEWS (optionally scoped to a service via nested route)
// ---------------------------------------------------------------------------
export async function getReviews({
	serviceId,
	filter,
	sortBy,
	page,
}: {
	serviceId?: string | null;
	filter?: FilterParam | null;
	sortBy?: SortParam | null;
	page?: number;
}): Promise<{ data: Review[]; count: number }> {
	const params = new URLSearchParams();

	// Filtering
	if (filter) {
		params.set(filter.field, filter.value);
	}

	// Sorting
	if (sortBy) {
		const prefix = sortBy.direction === 'desc' ? '-' : '';
		params.set('sort', `${prefix}${sortBy.field}`);
	}

	// Pagination
	if (page) {
		params.set('page', String(page));
		params.set('limit', String(PAGE_SIZE));
	}

	// Use nested route when serviceId is provided
	const baseUrl = serviceId
		? `${API_URL}/services/${serviceId}/reviews`
		: `${API_URL}/reviews`;

	const res = await fetch(`${baseUrl}?${params.toString()}`, {
		method: 'GET',
		credentials: 'include',
		headers: getAuthHeaders(),
	});

	const data = await res.json();

	if (data.status !== 'success') {
		throw new Error(data.message);
	}

	// factory.getAll() → data.docs + results count
	return { data: data.data.docs as Review[], count: data.results };
}

// ---------------------------------------------------------------------------
// CREATE REVIEW
// ---------------------------------------------------------------------------
export async function createReview(
	reviewData: CreateReviewFormData,
): Promise<Review> {
	const res = await fetch(`${API_URL}/reviews`, {
		method: 'POST',
		credentials: 'include',
		headers: getAuthHeaders(),
		body: JSON.stringify(reviewData),
	});

	const data = await res.json();

	if (data.status !== 'success') {
		throw new Error(data.message);
	}

	return data.data.data as Review;
}

// ---------------------------------------------------------------------------
// DELETE REVIEW
// ---------------------------------------------------------------------------
export async function deleteReview(id: string): Promise<void> {
	const res = await fetch(`${API_URL}/reviews/${id}`, {
		method: 'DELETE',
		credentials: 'include',
		headers: getAuthHeaders(),
	});

	// should return 204 on success
	if (res.status !== 204) {
		const data = await res.json();
		throw new Error(data.message);
	}
}
