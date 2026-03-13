import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { api } from "../../../lib/axios";
import type {
  RoomActionResponse,
  RoomListItem,
  RoomMembershipResponse,
} from "../types/chat";
import { ROOMS_QUERY_KEY } from "./useRooms";

const getErrorMessage = (error: unknown): string => {
  if (isAxiosError<{ message?: string; error?: string }>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to leave room"
    );
  }
  return "Failed to leave room";
};

export const useLeaveRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: number) => {
      const { data } = await api.post<RoomActionResponse>(
        `/api/rooms/${roomId}/leave`,
      );
      return { response: data, roomId };
    },
    onSuccess: ({ response, roomId }) => {
      queryClient.setQueryData<RoomListItem[]>(
        ROOMS_QUERY_KEY,
        (currentRooms = []) =>
          currentRooms.filter((room) => room.id !== roomId),
      );
      queryClient.setQueryData<RoomMembershipResponse>(
        ["room-membership", roomId],
        {
          roomId,
          isMember: false,
        },
      );
      queryClient.removeQueries({ queryKey: ["room", roomId] });
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["room-membership", roomId] });
      queryClient.removeQueries({ queryKey: ["room-messages", roomId] });
      toast.success(response.message || "Left room successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
