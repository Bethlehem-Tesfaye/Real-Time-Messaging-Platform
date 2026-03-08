import { useEffect } from "react";
import { toast } from "sonner";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { authClient } from "../../../lib/authClient";

export interface VerifyEmailData {
  status: boolean;
  message?: string;
}

export type UseVerifyEmailResult = UseQueryResult<VerifyEmailData, Error>;

export const useVerifyEmail = (
  token: string | null | undefined,
): UseVerifyEmailResult => {
  const query = useQuery<VerifyEmailData, Error>({
    queryKey: ["verify-email", token],
    enabled: !!token,
    queryFn: async () => {
      if (!token) throw new Error("Missing verification token");
      const res = await authClient.verifyEmail({ query: { token } });

      if (res.error) throw new Error(res.error.message);
      return {
        status: res.data?.status ?? true,
        message:
          (res.data && "message" in res.data
            ? (res.data as any).message
            : undefined) ?? "Email verified",
      };
    },
  });

  useEffect(() => {
    if (query.isError) {
      toast.error("Email verification failed, please try again!");
    }
  }, [query.isError]);

  return query;
};
