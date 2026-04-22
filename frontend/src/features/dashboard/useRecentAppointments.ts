import { useQuery } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import type { Appointment } from '../../types';

async function fetchRecentAppointments(): Promise<Appointment[]> {
	const { data } = await apiClient.get('/appointments', {
		params: { limit: '6', sort: '-date' },
	});
	return data.data.docs as Appointment[];
}

export function useRecentAppointments() {
	const { data: appointments = [], isPending } = useQuery({
		queryKey: ['recent-appointments'],
		queryFn: fetchRecentAppointments,
	});
	return { appointments, isPending };
}
