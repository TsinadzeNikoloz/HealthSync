import { useQuery } from "@tanstack/react-query";
import { getTopServices } from "../../services/apiServices";

export function useTopServices() {
  const { data: topServices = [], isPending, error } = useQuery({
    queryKey: ["services", "top-5"],
    queryFn: getTopServices,
  });

  return { topServices, isPending, error };
}
