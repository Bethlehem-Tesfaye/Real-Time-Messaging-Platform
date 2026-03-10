import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { api } from "../../../lib/axios";
import { MY_PROFILE_QUERY_KEY } from "./useMyProfile";
import type { ProfileApiResponse, UpsertProfileInput } from "../types/profile";

const getErrorMessage = (error: unknown): string => {
  if (isAxiosError<{ message?: string; error?: string }>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to save profile"
    );
  }
  return "Failed to save profile";
};

export const useUpsertProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpsertProfileInput) => {
      const formData = new FormData();
      formData.append("username", payload.username);
      formData.append("displayName", payload.displayName);

      if (payload.bio?.trim()) {
        formData.append("bio", payload.bio.trim());
      }

      if (payload.avatar) {
        formData.append("avatar", payload.avatar);
      }

      if (payload.removeAvatar) {
        formData.append("removeAvatar", "true");
      }

      const { data } = await api.put<ProfileApiResponse>(
        "/api/profile/me",
        formData,
      );
      return data.data;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(MY_PROFILE_QUERY_KEY, profile);
      toast.success("Profile saved");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
