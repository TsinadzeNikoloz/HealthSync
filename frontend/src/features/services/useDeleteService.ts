import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteService as deleteServiceApi } from "../../services/apiServices";

export function useDeleteService() {
  const queryClient = useQueryClient();

  const { mutate: deleteService, isPending: isDeleting } = useMutation({
    mutationFn: deleteServiceApi,
    onSuccess: () => {
      toast.success("Service successfully deleted");
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { deleteService, isDeleting };
}
