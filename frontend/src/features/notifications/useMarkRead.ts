import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationRead } from "../../services/apiNotifications";

export function useMarkRead() {
  const queryClient = useQueryClient();

  const { mutate: markRead } = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return { markRead };
}
