import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import type { Profile, ProfileApiResponse } from "../types/profile";

export const MY_PROFILE_QUERY_KEY = ["my-profile"] as const;

type UseMyProfileOptions = {
  enabled?: boolean;
};

export const useMyProfile = (options?: UseMyProfileOptions) => {
  return useQuery<Profile>({
    queryKey: MY_PROFILE_QUERY_KEY,
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const { data } = await api.get<ProfileApiResponse>("/api/profile/me");
      return data.data;
    },
  });
};
