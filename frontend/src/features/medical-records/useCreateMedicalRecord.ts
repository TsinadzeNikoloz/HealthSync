import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createMedicalRecord as createRecordApi } from "../../services/apiMedicalRecords";

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();

  const { mutate: createRecord, isPending: isCreating } = useMutation({
    mutationFn: createRecordApi,
    onSuccess: () => {
      toast.success("Medical record successfully created");
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { createRecord, isCreating };
}
