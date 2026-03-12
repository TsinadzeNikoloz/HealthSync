import { useQuery } from '@tanstack/react-query';
import { getAppointmentStats } from '../../services/apiAppointments';

export function useAppointmentStats() {
	const { data, isPending } = useQuery({
		queryKey: ['appointment-stats'],
		queryFn: getAppointmentStats,
	});

	return {
		totalRevenue: data?.totalRevenue ?? 0,
		totalAppointments: data?.totalAppointments ?? 0,
		completionRate: data?.completionRate ?? 0,
		cancellationRate: data?.cancellationRate ?? 0,
		revenueByMonth: data?.revenueByMonth ?? [],
		mostBooked: data?.mostBooked ?? [],
		isPending,
	};
}
