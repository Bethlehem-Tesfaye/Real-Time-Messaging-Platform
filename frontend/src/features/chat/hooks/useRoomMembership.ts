import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import type { RoomMembershipResponse } from "../types/chat";

export const useRoomMembership = (roomId?: number) => {
  return useQuery({
    queryKey: ["room-membership", roomId],
    queryFn: async () => {
      const { data } = await api.get<RoomMembershipResponse>(
        `/api/rooms/${roomId}/membership`,
      );
      return data;
    },
    enabled: typeof roomId === "number",
  });
};
