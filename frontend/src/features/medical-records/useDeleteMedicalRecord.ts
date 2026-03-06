import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteMedicalRecord as deleteRecordApi } from "../../services/apiMedicalRecords";

export function useDeleteMedicalRecord() {
  const queryClient = useQueryClient();

  const { mutate: deleteRecord, isPending: isDeleting } = useMutation({
    mutationFn: deleteRecordApi,
    onSuccess: () => {
      toast.success("Medical record successfully deleted");
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { deleteRecord, isDeleting };
}
