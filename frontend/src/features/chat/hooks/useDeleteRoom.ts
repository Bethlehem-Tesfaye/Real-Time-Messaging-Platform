import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { api } from "../../../lib/axios";
import type { RoomActionResponse, RoomListItem } from "../types/chat";
import { ROOMS_QUERY_KEY } from "./useRooms";

const getErrorMessage = (error: unknown): string => {
  if (isAxiosError<{ message?: string; error?: string }>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to delete room"
    );
  }
  return "Failed to delete room";
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: number) => {
      const { data } = await api.delete<RoomActionResponse>(
        `/api/rooms/${roomId}`,
      );
      return { response: data, roomId };
    },
    onSuccess: ({ response, roomId }) => {
      queryClient.setQueryData<RoomListItem[]>(
        ROOMS_QUERY_KEY,
        (currentRooms = []) =>
          currentRooms.filter((room) => room.id !== roomId),
      );
      queryClient.removeQueries({ queryKey: ["room", roomId] });
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
      toast.success(response.message || "Room deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
