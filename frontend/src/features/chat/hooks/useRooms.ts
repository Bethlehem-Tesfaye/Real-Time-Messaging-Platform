import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import type { RoomListItem } from "../types/chat";

export const ROOMS_QUERY_KEY = ["rooms"] as const;

export type RoomsFilter = {
  scope: "all" | "created" | "member";
  search: string;
};

export const useRooms = (filters: RoomsFilter) => {
  return useQuery({
    queryKey: [...ROOMS_QUERY_KEY, filters.scope, filters.search],
    queryFn: async () => {
      const { data } = await api.get<RoomListItem[]>("/api/rooms", {
        params: {
          scope: filters.scope,
          ...(filters.search.trim().length > 0
            ? { search: filters.search.trim() }
            : {}),
        },
      });
      return data;
    },
  });
};
