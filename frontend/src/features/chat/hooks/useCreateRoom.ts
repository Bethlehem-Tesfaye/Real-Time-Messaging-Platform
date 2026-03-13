import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { api } from "../../../lib/axios";
import type { CreateRoomInput, RoomListItem } from "../types/chat";
import { ROOMS_QUERY_KEY } from "./useRooms";

const getErrorMessage = (error: unknown): string => {
  if (isAxiosError<{ message?: string; error?: string }>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to create room"
    );
  }
  return "Failed to create room";
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateRoomInput) => {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("is_private", String(payload.is_private ?? false));

      if (payload.avatar) {
        formData.append("avatar", payload.avatar);
      }

      const { data } = await api.post<RoomListItem>("/api/rooms", formData);
      return data;
    },
    onSuccess: (createdRoom) => {
      queryClient.setQueryData<RoomListItem[]>(
        ROOMS_QUERY_KEY,
        (currentRooms = []) => {
          const hasRoom = currentRooms.some(
            (room) => room.id === createdRoom.id,
          );
          if (hasRoom) return currentRooms;
          return [createdRoom, ...currentRooms];
        },
      );

      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
      toast.success("Room created");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
