import { useQuery } from '@tanstack/react-query';
import { getAvailableSlots } from '../../services/apiAppointments';

export function useAvailableSlots(
	doctorId: string | undefined,
	date: string | undefined,
	duration?: number,
) {
	const { data: slots = [], isPending } = useQuery({
		queryKey: ['availableSlots', doctorId, date, duration],
		queryFn: () =>
			getAvailableSlots({ doctorId: doctorId!, date: date!, duration }),
		enabled: !!doctorId && !!date,
		staleTime: 300000,
	});

	return { slots, isPending };
}
