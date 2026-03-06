import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getDoctors } from "../../services/apiUsers";
import { PAGE_SIZE } from "../../utils/constants";

export function useDoctors() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // Filter
  const filterValue = searchParams.get("specialty");
  const filter =
    !filterValue || filterValue === "all"
      ? null
      : { field: "specialty", value: filterValue };

  // Sort
  const sortByRaw = searchParams.get("sortBy") || "name-asc";
  const [field, direction] = sortByRaw.split("-") as [string, "asc" | "desc"];
  const sortBy = { field, direction };

  // Page
  const page = Number(searchParams.get("page")) || 1;

  // Search
  const search = searchParams.get("search") || "";

  const {
    data: { data: doctors, count } = { data: [], count: 0 },
    isPending,
    error,
  } = useQuery({
    queryKey: ["doctors", filter, sortBy, page, search],
    queryFn: () => getDoctors({ filter, sortBy, page, search }),
  });

  // Prefetch next page
  const pageCount = Math.ceil(count / PAGE_SIZE);
  if (page < pageCount) {
    queryClient.prefetchQuery({
      queryKey: ["doctors", filter, sortBy, page + 1, search],
      queryFn: () => getDoctors({ filter, sortBy, page: page + 1, search }),
    });
  }

  return { doctors, count, isPending, error };
}
