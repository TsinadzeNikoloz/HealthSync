import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createAppointment as createAppointmentApi } from "../../services/apiAppointments";

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  const { mutate: createAppointment, isPending: isCreating } = useMutation({
    mutationFn: createAppointmentApi,
    onSuccess: () => {
      toast.success("New appointment successfully created");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { createAppointment, isCreating };
}
