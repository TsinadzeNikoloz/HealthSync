import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updatePassword as updatePasswordApi } from "../../services/apiAuth";
import type { UpdatePasswordFormData } from "../../types";

export function useUpdatePassword() {
  const { mutate: updatePassword, isPending: isUpdating } = useMutation({
    mutationFn: (passwords: UpdatePasswordFormData) =>
      updatePasswordApi(passwords),
    onSuccess: () => {
      toast.success("Password successfully updated");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update password");
    },
  });

  return { updatePassword, isUpdating };
}
