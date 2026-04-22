import apiClient from './apiClient';
import { buildQueryParams } from './buildQueryParams';
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
	const params = buildQueryParams({ filter, sortBy, page });

	// Use nested route when serviceId is provided
	const url = serviceId
		? `/services/${serviceId}/reviews`
		: '/reviews';

	const { data } = await apiClient.get(url, { params });
	return { data: data.data.docs as Review[], count: data.results };
}

// ---------------------------------------------------------------------------
// CREATE REVIEW
// ---------------------------------------------------------------------------
export async function createReview(
	reviewData: CreateReviewFormData,
): Promise<Review> {
	const { data } = await apiClient.post('/reviews', reviewData);
	return data.data.doc as Review;
}

// ---------------------------------------------------------------------------
// DELETE REVIEW
// ---------------------------------------------------------------------------
export async function deleteReview(id: string): Promise<void> {
	await apiClient.delete(`/reviews/${id}`);
}
