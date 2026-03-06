import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteAppointment as deleteAppointmentApi } from "../../services/apiAppointments";

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  const { mutate: deleteAppointment, isPending: isDeleting } = useMutation({
    mutationFn: deleteAppointmentApi,
    onSuccess: () => {
      toast.success("Appointment successfully deleted");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { deleteAppointment, isDeleting };
}
