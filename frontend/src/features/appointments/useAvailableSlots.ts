import { useQuery } from "@tanstack/react-query";
import { getAvailableSlots } from "../../services/apiAppointments";

export function useAvailableSlots(
  doctorId: string | undefined,
  date: string | undefined,
  serviceId?: string,
) {
  const { data: slots = [], isPending } = useQuery({
    queryKey: ["availableSlots", doctorId, date, serviceId],
    queryFn: () =>
      getAvailableSlots({ doctorId: doctorId!, date: date!, serviceId }),
    enabled: !!doctorId && !!date,
    staleTime: 30_000,
  });

  return { slots, isPending };
}
