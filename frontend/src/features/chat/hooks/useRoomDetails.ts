import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import type { RoomDetails } from "../types/chat";

export const useRoomDetails = (roomId?: number) => {
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      const { data } = await api.get<RoomDetails>(`/api/rooms/${roomId}`);
      return data;
    },
    enabled: typeof roomId === "number",
  });
};
