import { useQuery } from "@tanstack/react-query";
import { getServiceStats } from "../../services/apiServices";

export interface ServiceStat {
  _id: string;
  numServices: number;
  numRatings: number;
  avgRating: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
}

export function useServiceStats() {
  const { data: stats = [], isPending, error } = useQuery({
    queryKey: ["service-stats"],
    queryFn: getServiceStats,
  });

  return { stats: stats as ServiceStat[], isPending, error };
}
