import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateAppointment } from "../../services/apiAppointments";

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  const { mutate: editAppointment, isPending: isUpdating } = useMutation({
    mutationFn: updateAppointment,
    onSuccess: () => {
      toast.success("Appointment successfully updated");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { editAppointment, isUpdating };
}
