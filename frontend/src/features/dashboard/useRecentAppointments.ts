import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { subDays } from "date-fns";
import { getAppointments } from "../../services/apiAppointments";

export function useRecentAppointments() {
  const [searchParams] = useSearchParams();
  const numDays = !searchParams.get("last")
    ? 7
    : Number(searchParams.get("last"));

  const queryDate = subDays(new Date(), numDays).toISOString();

  const {
    data: { data: appointments } = { data: [], count: 0 },
    isPending,
  } = useQuery({
    queryKey: ["appointments", `last-${numDays}`],
    queryFn: () =>
      getAppointments({
        filter: { field: "date[gte]", value: queryDate },
        sortBy: { field: "date", direction: "desc" },
      }),
  });

  return { appointments, isPending, numDays };
}
