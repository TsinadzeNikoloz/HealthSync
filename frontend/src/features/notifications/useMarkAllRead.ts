import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAllNotificationsRead } from "../../services/apiNotifications";

export function useMarkAllRead() {
  const queryClient = useQueryClient();

  const { mutate: markAllRead, isPending } = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return { markAllRead, isPending };
}
