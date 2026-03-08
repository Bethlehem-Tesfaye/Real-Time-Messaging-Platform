import { useMutation } from "@tanstack/react-query";
import { authClient } from "../../../lib/authClient";

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: { email: string; redirectTo: string }) => {
      const res = await authClient.requestPasswordReset(data);
      return res.data;
    },
  });
};
