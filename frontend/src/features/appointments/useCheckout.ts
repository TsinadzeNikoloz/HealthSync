import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getCheckoutSession } from "../../services/apiAppointments";

export function useCheckout() {
  const { mutate: checkout, isPending: isCheckingOut } = useMutation({
    mutationFn: getCheckoutSession,
    onSuccess: ({ url }) => {
      // Redirect to Stripe Checkout
      window.location.href = url;
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { checkout, isCheckingOut };
}
