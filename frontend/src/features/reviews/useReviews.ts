import { useQuery } from "@tanstack/react-query";
import { getReviews } from "../../services/apiReviews";

export function useReviews(serviceId?: string) {
  const {
    data: { data: reviews, count } = { data: [], count: 0 },
    isPending,
    error,
  } = useQuery({
    queryKey: ["reviews", serviceId],
    queryFn: () => getReviews({ serviceId }),
  });

  return { reviews, count, isPending, error };
}
