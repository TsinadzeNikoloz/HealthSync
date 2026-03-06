import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createReview as createReviewApi } from "../../services/apiReviews";

export function useCreateReview() {
  const queryClient = useQueryClient();

  const { mutate: createReview, isPending: isCreating } = useMutation({
    mutationFn: createReviewApi,
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["service"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { createReview, isCreating };
}
