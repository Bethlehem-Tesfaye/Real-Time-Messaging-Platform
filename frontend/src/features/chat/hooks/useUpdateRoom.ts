import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { api } from "../../../lib/axios";
import type { RoomListItem, UpdateRoomInput } from "../types/chat";
import { ROOMS_QUERY_KEY } from "./useRooms";

const getErrorMessage = (error: unknown): string => {
  if (isAxiosError<{ message?: string; error?: string }>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to update room"
    );
  }
  return "Failed to update room";
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateRoomInput) => {
      const formData = new FormData();

      if (payload.name !== undefined) {
        formData.append("name", payload.name);
      }
      if (payload.is_private !== undefined) {
        formData.append("is_private", String(payload.is_private));
      }
      if (payload.avatar) {
        formData.append("avatar", payload.avatar);
      }
      if (payload.removeAvatar) {
        formData.append("removeAvatar", "true");
      }

      const { data } = await api.put<RoomListItem>(
        `/api/rooms/${id}`,
        formData,
      );
      return data;
    },
    onSuccess: (updatedRoom) => {
      queryClient.setQueryData<RoomListItem[]>(
        ROOMS_QUERY_KEY,
        (currentRooms = []) =>
          currentRooms.map((room) =>
            room.id === updatedRoom.id ? updatedRoom : room,
          ),
      );
      queryClient.invalidateQueries({ queryKey: ["room", updatedRoom.id] });
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
      toast.success("Room updated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
