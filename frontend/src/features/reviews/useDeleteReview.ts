import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteReview as deleteReviewApi } from "../../services/apiReviews";

export function useDeleteReview() {
  const queryClient = useQueryClient();

  const { mutate: deleteReview, isPending: isDeleting } = useMutation({
    mutationFn: deleteReviewApi,
    onSuccess: () => {
      toast.success("Review successfully deleted");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["service"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { deleteReview, isDeleting };
}
