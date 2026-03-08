import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { authClient } from "../../../lib/authClient";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  callbackURL: string;
}

export interface RegisterUser {
  id: string;
  name?: string;
  email: string;
  // add other fields if needed
}

export interface RegisterResponse {
  user: RegisterUser;
  session?: unknown; // optional session info, replace 'unknown' with actual type if available
}

export interface UseRegisterResult {
  register: (input: RegisterInput) => Promise<RegisterResponse>;
  isLoading: boolean;
  error: Error | null;
  data: RegisterResponse | undefined;
}

export const useRegister = (): UseRegisterResult => {
  const navigate = useNavigate();

  const mutation: UseMutationResult<RegisterResponse, Error, RegisterInput> =
    useMutation({
      mutationFn: async ({
        name,
        email,
        password,
        callbackURL,
      }: RegisterInput) => {
        const res = await authClient.signUp.email({
          name,
          email,
          password,
          callbackURL,
        });

        if (res.error) throw new Error(res.error.message);
        return res.data; // { user, session? }
      },
      onSuccess: (data) => {
        toast.success(`Welcome, ${data.user.email}! Please verify your email.`);
        navigate("/verify-notice");
      },
      onError: (error: Error) => {
        toast.error(error.message || "Registration failed, please try again.");
      },
    });

  return {
    register: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
};
