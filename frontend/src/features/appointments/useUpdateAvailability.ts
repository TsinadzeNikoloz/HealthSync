import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateAvailability } from "../../services/apiAuth";
import type { AvailabilitySlot } from "../../types";

export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  const { mutate: saveAvailability, isPending: isSaving } = useMutation({
    mutationFn: (availability: AvailabilitySlot[]) =>
      updateAvailability(availability),
    onSuccess: () => {
      toast.success("Schedule updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to save schedule"),
  });

  return { saveAvailability, isSaving };
}
