import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  getAppointments,
  getMyAppointments,
} from "../../services/apiAppointments";
import { useUser } from "../authentication/useUser";
import { PAGE_SIZE } from "../../utils/constants";

export function useAppointments() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { user } = useUser();

  const isPatient = user?.role === "USER";

  // FILTER
  const filterValue = searchParams.get("status");
  const filter =
    !filterValue || filterValue === "all"
      ? null
      : { field: "status", value: filterValue };

  // SORT
  const sortByRaw = searchParams.get("sortBy") || "date-desc";
  const [field, direction] = sortByRaw.split("-") as [string, "asc" | "desc"];
  const sortBy = { field, direction };

  // PAGINATION
  const page = !searchParams.get("page")
    ? 1
    : Number(searchParams.get("page"));

  const search = searchParams.get("search") || "";
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;

  // QUERY — patients use /my-appointments, staff use /appointments
  const {
    data: { data: appointments, count } = { data: [], count: 0 },
    isPending,
    error,
  } = useQuery({
    queryKey: isPatient
      ? ["my-appointments", filter, sortBy, page, dateFrom, dateTo]
      : ["appointments", filter, sortBy, page, search, dateFrom, dateTo],
    queryFn: isPatient
      ? () => getMyAppointments({ filter, sortBy, page, dateFrom, dateTo })
      : () => getAppointments({ filter, sortBy, page, search, dateFrom, dateTo }),
  });

  // PRE-FETCHING
  const pageCount = Math.ceil(count / PAGE_SIZE);

  if (page < pageCount)
    queryClient.prefetchQuery({
      queryKey: isPatient
        ? ["my-appointments", filter, sortBy, page + 1, dateFrom, dateTo]
        : ["appointments", filter, sortBy, page + 1, search, dateFrom, dateTo],
      queryFn: isPatient
        ? () => getMyAppointments({ filter, sortBy, page: page + 1, dateFrom, dateTo })
        : () => getAppointments({ filter, sortBy, page: page + 1, search, dateFrom, dateTo }),
    });

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: isPatient
        ? ["my-appointments", filter, sortBy, page - 1, dateFrom, dateTo]
        : ["appointments", filter, sortBy, page - 1, search, dateFrom, dateTo],
      queryFn: isPatient
        ? () => getMyAppointments({ filter, sortBy, page: page - 1, dateFrom, dateTo })
        : () => getAppointments({ filter, sortBy, page: page - 1, search, dateFrom, dateTo }),
    });

  return { appointments, count, isPending, error };
}
