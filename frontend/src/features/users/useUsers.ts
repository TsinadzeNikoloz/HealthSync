import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getUsers } from "../../services/apiUsers";
import { PAGE_SIZE } from "../../utils/constants";

export function useUsers() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const filterValue = searchParams.get("role");
  const filter =
    !filterValue || filterValue === "all"
      ? null
      : { field: "role", value: filterValue };

  const sortByRaw = searchParams.get("sortBy") || "name-asc";
  const [field, direction] = sortByRaw.split("-") as [string, "asc" | "desc"];
  const sortBy = { field, direction };

  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  const {
    data: { data: users, count } = { data: [], count: 0 },
    isPending,
    error,
  } = useQuery({
    queryKey: ["users", filter, sortBy, page, search],
    queryFn: () => getUsers({ filter, sortBy, page, search }),
  });

  // Prefetch next/prev pages
  const pageCount = Math.ceil(count / PAGE_SIZE);

  if (page < pageCount)
    queryClient.prefetchQuery({
      queryKey: ["users", filter, sortBy, page + 1, search],
      queryFn: () => getUsers({ filter, sortBy, page: page + 1, search }),
    });

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["users", filter, sortBy, page - 1, search],
      queryFn: () => getUsers({ filter, sortBy, page: page - 1, search }),
    });

  return { users, count, isPending, error };
}
