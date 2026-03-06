import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getMedicalRecords } from "../../services/apiMedicalRecords";
import { PAGE_SIZE } from "../../utils/constants";

export function useMedicalRecords() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const sortByRaw = searchParams.get("sortBy") || "createdAt-desc";
  const [field, direction] = sortByRaw.split("-") as [string, "asc" | "desc"];
  const sortBy = { field, direction };

  const page = !searchParams.get("page")
    ? 1
    : Number(searchParams.get("page"));

  const search = searchParams.get("search") || "";

  const {
    data: { data: records, count } = { data: [], count: 0 },
    isPending,
    error,
  } = useQuery({
    queryKey: ["medical-records", sortBy, page, search],
    queryFn: () => getMedicalRecords({ sortBy, page, search }),
  });

  const pageCount = Math.ceil(count / PAGE_SIZE);

  if (page < pageCount)
    queryClient.prefetchQuery({
      queryKey: ["medical-records", sortBy, page + 1, search],
      queryFn: () => getMedicalRecords({ sortBy, page: page + 1, search }),
    });

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["medical-records", sortBy, page - 1, search],
      queryFn: () => getMedicalRecords({ sortBy, page: page - 1, search }),
    });

  return { records, count, isPending, error };
}
