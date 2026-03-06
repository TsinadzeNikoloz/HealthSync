import { useQuery } from "@tanstack/react-query";
import { getService } from "../../services/apiServices";

export function useService(id: string) {
  const {
    data: service,
    isPending,
    error,
  } = useQuery({
    queryKey: ["service", id],
    queryFn: () => getService(id),
    enabled: !!id,
  });

  return { service, isPending, error };
}
