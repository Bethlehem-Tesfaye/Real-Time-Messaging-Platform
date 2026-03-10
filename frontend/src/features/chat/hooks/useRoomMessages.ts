import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import type { ChatMessage } from "../types/chat";

export const useRoomMessages = (
  roomId?: number,
  limit = 50,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["room-messages", roomId, limit],
    queryFn: async () => {
      const { data } = await api.get<ChatMessage[]>(
        `/api/messages/rooms/${roomId}`,
        {
          params: { limit },
        },
      );
      return data;
    },
    enabled: typeof roomId === "number" && enabled,
  });
};
