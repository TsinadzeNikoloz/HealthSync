import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateService } from "../../services/apiServices";

export function useEditService() {
  const queryClient = useQueryClient();

  const { mutate: editService, isPending: isEditing } = useMutation({
    mutationFn: updateService,
    onSuccess: () => {
      toast.success("Service successfully edited");
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { editService, isEditing };
}
