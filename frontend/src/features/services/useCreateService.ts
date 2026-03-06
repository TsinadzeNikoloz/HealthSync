import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createService as createServiceApi } from "../../services/apiServices";

export function useCreateService() {
  const queryClient = useQueryClient();

  const { mutate: createService, isPending: isCreating } = useMutation({
    mutationFn: createServiceApi,
    onSuccess: () => {
      toast.success("New service successfully created");
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { createService, isCreating };
}
