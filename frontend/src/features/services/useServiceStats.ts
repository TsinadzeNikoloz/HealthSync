import { useQuery } from "@tanstack/react-query";
import { getServiceStats } from "../../services/apiServices";
import type { ServiceStat } from "../../types";

export type { ServiceStat };

export function useServiceStats() {
  const { data: stats = [], isPending, error } = useQuery<ServiceStat[]>({
    queryKey: ["service-stats"],
    queryFn: getServiceStats,
  });

  return { stats, isPending, error };
}
