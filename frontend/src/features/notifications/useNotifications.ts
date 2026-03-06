import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../../services/apiNotifications";

export function useNotifications() {
  const { data, isPending } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 10000,
  });

  const notifications = data ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, isPending };
}
