import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { authClient } from "../../../lib/authClient";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface LoginInput {
  email: string;
  password: string;
}

interface LoginUser {
  id: string;
  email: string;
  name?: string;
  // add other fields if needed
}

interface LoginResponse {
  user: LoginUser;
  // add other fields from your API if needed
}

interface UseLoginResult {
  login: (input: LoginInput) => Promise<LoginResponse>;
  isLoading: boolean;
  error: Error | null;
  data: LoginResponse | undefined;
}

export const useLogin = (): UseLoginResult => {
  const navigate = useNavigate();

  const mutation: UseMutationResult<LoginResponse, Error, LoginInput> =
    useMutation({
      mutationFn: async ({ email, password }: LoginInput) => {
        const res = await authClient.signIn.email({ email, password });

        if (res.error) throw new Error(res.error.message);
        return res.data;
      },
      onSuccess: (data) => {
        toast.success(`Welcome back, ${data.user.email}!`);
        navigate("/dashboard");
      },
      onError: (error: Error) => {
        toast.error(error.message || "Login failed, try again");
      },
    });

  return {
    login: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
};
